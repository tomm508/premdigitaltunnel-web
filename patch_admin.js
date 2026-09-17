import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Insert a python script that listens to firestore changes via REST and executes the account creation
const scriptAddition = `
# 4. Pasang Auto-Creator Service (Python)
cat > /root/premdigital_creator.py << 'EOF_PY'
import urllib.request
import json
import subprocess
import time
import os

PROJECT_ID="\${PROJECT_ID}"
API_KEY="\${API_KEY}"
SERVER_ID="\${NODE_ID}"

BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"
QUERY_URL = f"{BASE_URL}:runQuery?key={API_KEY}"

def get_pending_commands():
    query_payload = {
        "structuredQuery": {
            "from": [{"collectionId": "vps_commands"}],
            "where": {
                "compositeFilter": {
                    "op": "AND",
                    "filters": [
                        {"fieldFilter": {"field": {"fieldPath": "serverId"}, "op": "EQUAL", "value": {"stringValue": SERVER_ID}}},
                        {"fieldFilter": {"field": {"fieldPath": "status"}, "op": "EQUAL", "value": {"stringValue": "pending"}}}
                    ]
                }
            }
        }
    }
    
    try:
        req = urllib.request.Request(QUERY_URL, data=json.dumps(query_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            commands = []
            for item in res_data:
                if 'document' in item:
                    doc = item['document']
                    doc_id = doc['name'].split('/')[-1]
                    fields = doc.get('fields', {})
                    # pastikan statusnya pending
                    if fields.get('status', {}).get('stringValue') == 'pending':
                         commands.append({
                             "id": doc_id,
                             "username": fields.get('username', {}).get('stringValue', ''),
                             "password": fields.get('password', {}).get('stringValue', ''),
                             "action": fields.get('action', {}).get('stringValue', ''),
                             "activeDays": fields.get('activeDays', {}).get('integerValue', '30')
                         })
            return commands
    except Exception as e:
        print("Error fetching commands:", e)
        return []

def update_command_status(doc_id, status, message=""):
    patch_url = f"{BASE_URL}/vps_commands/{doc_id}?updateMask.fieldPaths=status&updateMask.fieldPaths=message&key={API_KEY}"
    payload = {
        "fields": {
            "status": {"stringValue": status},
            "message": {"stringValue": message}
        }
    }
    try:
        req = urllib.request.Request(patch_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
        with urllib.request.urlopen(req) as response:
            pass
    except Exception as e:
        print("Error updating status:", e)

def create_ssh_account(username, password, days):
    if not username or not password:
        return False, "Username/Password kosong"
    try:
        # Create user
        subprocess.run(['useradd', '-e', f'$(date -d "{days} days" +"%Y-%m-%d")', '-s', '/bin/false', '-M', username], check=True, stderr=subprocess.PIPE)
        # Set password
        process = subprocess.Popen(['chpasswd'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        process.communicate(f"{username}:{password}")
        if process.returncode != 0:
            return False, "Gagal set password"
        return True, "Sukses"
    except subprocess.CalledProcessError as e:
        return False, f"Gagal membuat user: {e.stderr.decode().strip()}"
    except Exception as e:
        return False, str(e)

while True:
    commands = get_pending_commands()
    for cmd in commands:
        if cmd['action'] == 'CREATE_ACCOUNT':
             success, msg = create_ssh_account(cmd['username'], cmd['password'], cmd['activeDays'])
             if success:
                 update_command_status(cmd['id'], 'success', 'Account created successfully')
             else:
                 update_command_status(cmd['id'], 'error', msg)
    time.sleep(5)
EOF_PY

cat > /etc/systemd/system/premdigital_creator.service << 'EOF_SVC'
[Unit]
Description=PremDigital VPS Auto-Creator Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /root/premdigital_creator.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF_SVC

systemctl daemon-reload
systemctl enable premdigital_creator
systemctl restart premdigital_creator
`;

code = code.replace('# 3. Pasang Cronjob', scriptAddition + '\n\n# 5. Pasang Cronjob (Reporter)');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
