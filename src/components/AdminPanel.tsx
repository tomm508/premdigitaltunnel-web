// Trigger sync: Admin Panel Topup Proof
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, collection, onSnapshot, setDoc, updateDoc, getDoc } from '../lib/firebase';
import { Settings, Users, Server, Clock, Save, ShieldAlert, CheckCircle2, BarChart2, Terminal, Copy, Check, RefreshCw, Cpu, HardDrive, Globe, Radio, X } from 'lucide-react';
import { SERVERS_LIST, INITIAL_STATS } from '../data/mockData';
import { firebaseConfig } from '../lib/firebaseConfig';
import { VpsNode } from '../types';
import { isNodeHeartbeatActive } from '../lib/serverSync';

interface AdminPanelProps {
  isDark: boolean;
  userRole: 'member' | 'admin';
}


function SafeImage({ src, alt, className }: { src: string, alt: string, className: string }) {
  const [blobUrl, setBlobUrl] = React.useState<string>(src);
  
  React.useEffect(() => {
    if (!src || !src.startsWith('http')) {
      setBlobUrl(src);
      return;
    }
    
    let isMounted = true;
    fetch(src)
      .then(res => res.blob())
      .then(blob => {
        if (isMounted) {
          setBlobUrl(URL.createObjectURL(blob));
        }
      })
      .catch(err => {
        console.error("SafeImage fetch error:", err);
        // Fallback to normal src if fetch fails
      });
      
    return () => {
      isMounted = false;
    };
  }, [src]);

  return <img src={blobUrl} alt={alt} className={className} />;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isDark, userRole }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'services' | 'stats' | 'vps'>('settings');
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);

  // Fetch pending topups polling
  const fetchPendingTopups = async () => {
    try {
      const { getDocs } = await import('firebase/firestore');
      const usersSnap = await getDocs(collection(db, 'users'));
      let allTopups: any[] = [];
      for (const uDoc of usersSnap.docs) {
        const topupsSnap = await getDocs(collection(db, 'users', uDoc.id, 'topups'));
        topupsSnap.docs.forEach((tDoc: any) => {
          const t = { id: tDoc.id, ...tDoc.data(), userDocId: uDoc.id };
          if (t.status === 'waiting_verification') {
            allTopups.push(t);
          }
        });
      }
      allTopups.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingTopups(allTopups);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingTopups();
    const interval = setInterval(fetchPendingTopups, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveTopup = async (topup: any) => {
    try {
      // 1. Get current user balance
      const userRef = doc(db, 'users', topup.uid);
      const userSnap = await getDoc(userRef);
      const currentBalance = userSnap.exists() ? (userSnap.data().balance || 0) : 0;
      
      // 2. Update balance
      await setDoc(userRef, {
        balance: currentBalance + topup.amount,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 3. Mark topup as success
      await setDoc(doc(db, 'users', topup.userDocId, 'topups', topup.id), {
        status: 'success',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      alert('Top Up sebesar Rp ' + topup.amount.toLocaleString() + ' berhasil disetujui.');
      fetchPendingTopups();
    } catch (err) {
      console.error(err);
      alert('Gagal menyetujui top up.');
    }
  };

  const handleRejectTopup = async (topup: any) => {
    if (confirm('Anda yakin ingin menolak Top Up ini?')) {
      try {
        await setDoc(doc(db, 'users', topup.userDocId, 'topups', topup.id), {
          status: 'rejected',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        fetchPendingTopups();
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  // Settings State
  const [priceSsh, setPriceSsh] = useState(1500);
  const [priceVmess, setPriceVmess] = useState(2500);
  const [priceVless, setPriceVless] = useState(2500);
  const [priceTrojan, setPriceTrojan] = useState(2500);
  const [premiumDiscount, setPremiumDiscount] = useState(50);
  const [freeLimit, setFreeLimit] = useState(50);
  const [premiumLimit, setPremiumLimit] = useState(500);
  const [resetTime, setResetTime] = useState('00:00');
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [qrisUrl, setQrisUrl] = useState('');
  
  // Stats State
  const [activeServers, setActiveServers] = useState(2);
  const [servicesToday, setServicesToday] = useState(0);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [breakdownSsh, setBreakdownSsh] = useState(0);
  const [breakdownTrojan, setBreakdownTrojan] = useState(0);
  const [breakdownVmess, setBreakdownVmess] = useState(0);
  const [breakdownVless, setBreakdownVless] = useState(0);

  // VPS Nodes Multi-Server State
  const [vpsNodes, setVpsNodes] = useState<VpsNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sg-premium-01');
  const [customNodeName, setCustomNodeName] = useState<string>('SG1 DigitalOcean');
  const [customNodeDomain, setCustomNodeDomain] = useState<string>('sgdo-premdigital.web.id');
  const [customNodeCity, setCustomNodeCity] = useState<string>('Singapore');
  const [customNodeCountryCode, setCustomNodeCountryCode] = useState<string>('SG');
  
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingDomainValue, setEditingDomainValue] = useState<string>('');
  const [isUpdatingNodeDomain, setIsUpdatingNodeDomain] = useState<boolean>(false);

  const handleUpdateNodeDomain = async (nodeId: string, newDomain: string) => {
    setIsUpdatingNodeDomain(true);
    try {
      await setDoc(doc(db, 'vps_nodes', nodeId), {
        domain: newDomain.trim(),
        host: newDomain.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setEditingNodeId(null);
      alert(`Domain untuk node ${nodeId} berhasil diperbarui menjadi: ${newDomain.trim()}`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal memperbarui domain node: ' + err.message);
    } finally {
      setIsUpdatingNodeDomain(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPriceSsh(data.pricing?.ssh || 1500);
        setPriceVmess(data.pricing?.vmess || 2500);
        setPriceVless(data.pricing?.vless || 2500);
        setPriceTrojan(data.pricing?.trojan || 2500);
        setPremiumDiscount(data.pricing?.discount ?? 50);
        setFreeLimit(data.freeAccountLimit || 50);
        setPremiumLimit(data.premiumAccountLimit || 500);
        setResetTime(data.resetTime || '00:00');
        setTurnstileSiteKey(data.turnstileSiteKey || '');
        setQrisUrl(data.qrisUrl || '');
      }
    });
    return () => unsub();
  }, []);

  // Listen to live VPS nodes
  useEffect(() => {
    const unsubNodes = onSnapshot(collection(db, 'vps_nodes'), (snap) => {
      const list: VpsNode[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const isOnline = isNodeHeartbeatActive(data.lastHeartbeat, data.status);
        list.push({
          id: d.id,
          name: data.name || d.id,
          ip: data.ip || '103.xxx.xxx.xxx',
          domain: data.domain || data.host || '',
          host: data.host || data.domain || '',
          city: data.city || 'Singapore',
          country: data.country || 'Global',
          countryCode: data.countryCode || 'SG',
          onlineUsers: Number(data.onlineUsers || 0),
          cpuLoad: Number(data.cpuLoad || 0),
          ramUsage: Number(data.ramUsage || 0),
          status: isOnline ? 'Online' : 'Down',
          lastHeartbeat: data.lastHeartbeat || '',
          sshOnline: Number(data.sshOnline || 0),
          xrayOnline: Number(data.xrayOnline || 0)
        });
      });
      setVpsNodes(list);
    }, (err) => {
      console.warn("Error listening to vps_nodes in admin:", err);
    });
    return () => unsubNodes();
  }, []);

  // Listen to Platform Stats in Firestore
  useEffect(() => {
    const unsubStats = onSnapshot(doc(db, 'platform', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveServers(typeof data.activeServers === 'number' ? data.activeServers : 0);
        setServicesToday(typeof data.servicesToday === 'number' ? data.servicesToday : 0);
        setTotalAccounts(typeof data.totalAccounts === 'number' ? data.totalAccounts : 0);
        setOnlineUsers(typeof data.onlineUsers === 'number' ? data.onlineUsers : 0);
        setBreakdownSsh(data.breakdown?.ssh || 0);
        setBreakdownTrojan(data.breakdown?.trojan || 0);
        setBreakdownVmess(data.breakdown?.vmess || 0);
        setBreakdownVless(data.breakdown?.vless || 0);
      }
    });
    return () => unsubStats();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await setDoc(doc(db, 'platform', 'settings'), {
        pricing: {
          ssh: Number(priceSsh),
          vmess: Number(priceVmess),
          vless: Number(priceVless),
          trojan: Number(priceTrojan),
          discount: Number(premiumDiscount),
        },
        freeAccountLimit: Number(freeLimit),
        premiumAccountLimit: Number(premiumLimit),
        resetTime: resetTime,
        turnstileSiteKey: turnstileSiteKey,
        qrisUrl: qrisUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'platform', 'stats'), {
        activeServers: Number(activeServers),
        servicesToday: Number(servicesToday),
        totalAccounts: Number(totalAccounts),
        onlineUsers: Number(onlineUsers),
        breakdown: {
          ssh: Number(breakdownSsh),
          trojan: Number(breakdownTrojan),
          vmess: Number(breakdownVmess),
          vless: Number(breakdownVless),
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving stats", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetCleanStats = async () => {
    if (!window.confirm("Yakin ingin mereset angka statistik ke 0 dan mencocokkan server riil?")) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'platform', 'stats'), {
        activeServers: SERVERS_LIST.length,
        servicesToday: 0,
        totalAccounts: 0,
        onlineUsers: 0,
        breakdown: {
          ssh: 0,
          trojan: 0,
          vmess: 0,
          vless: 0,
        },
        updatedAt: new Date().toISOString()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error resetting stats", err);
    } finally {
      setIsSaving(false);
    }
  };

  const vpsInstallerScript = `# 1. Buat konfigurasi Node:
cat > /root/node_config.txt << 'EOF2'
NODE_ID="${selectedNodeId}"
NODE_NAME="${customNodeName}"
DOMAIN="${customNodeDomain}"
CITY="${customNodeCity}"
COUNTRY_CODE="${customNodeCountryCode}"
PROJECT_ID="${firebaseConfig.projectId}"
API_KEY="${firebaseConfig.apiKey}"
EOF2

# 2. Buat script Auto-Reporter (Lapor IP, Host Domain, RAM & CPU ke Firestore)
cat > /root/premdigital_reporter.sh << 'EOF2'
#!/bin/bash
source /root/node_config.txt
if [ -z "\$REST_URL" ]; then
    REST_URL="https://firestore.googleapis.com/v1/projects/\${PROJECT_ID}/databases/(default)/documents/vps_nodes"
fi

# Otomatis baca domain dari file konfigurasi script VPN jika ada di VPS
for df in /etc/xray/domain /root/domain /etc/v2ray/domain /usr/local/etc/xray/domain; do
    if [ -f "\$df" ] && [ -s "\$df" ]; then
        AUTO_DOMAIN=\$(head -n 1 "\$df" | tr -d ' \r\n\t')
        [ -n "\$AUTO_DOMAIN" ] && DOMAIN="\$AUTO_DOMAIN"
        break
    fi
done
[ -z "\$DOMAIN" ] && DOMAIN="${customNodeDomain}"

SERVER_IP=\$(curl -s https://api.ipify.org || hostname -I | awk '{print \$1}')
[ -z "\$SERVER_IP" ] && SERVER_IP="127.0.0.1"
RAM_USAGE=\$(free | grep Mem | awk '{print int(\$3/\$2 * 100.0)}')
CPU_LOAD=\$(uptime | awk -F'load average:' '{ print \$2 }' | cut -d, -f1 | awk '{print int(\$1 * 100)}')
ONLINE_USERS=\$(netstat -tnpa 2>/dev/null | grep 'ESTABLISHED.*sshd' | wc -l)
JSON_PAYLOAD=\$(cat <<JSON
{
  "fields": {
    "name": { "stringValue": "\${NODE_NAME}" },
    "domain": { "stringValue": "\${DOMAIN}" },
    "host": { "stringValue": "\${DOMAIN}" },
    "ip": { "stringValue": "\${SERVER_IP}" },
    "city": { "stringValue": "\${CITY}" },
    "countryCode": { "stringValue": "\${COUNTRY_CODE}" },
    "status": { "stringValue": "Online" },
    "onlineUsers": { "integerValue": "\${ONLINE_USERS}" },
    "cpuLoad": { "integerValue": "\${CPU_LOAD}" },
    "ramUsage": { "integerValue": "\${RAM_USAGE}" },
    "lastHeartbeat": { "timestampValue": "\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" }
  }
}
JSON
)
curl -s -X PATCH "\${REST_URL}/\${NODE_ID}?updateMask.fieldPaths=name&updateMask.fieldPaths=domain&updateMask.fieldPaths=host&updateMask.fieldPaths=ip&updateMask.fieldPaths=city&updateMask.fieldPaths=countryCode&updateMask.fieldPaths=status&updateMask.fieldPaths=onlineUsers&updateMask.fieldPaths=cpuLoad&updateMask.fieldPaths=ramUsage&updateMask.fieldPaths=lastHeartbeat&key=\${API_KEY}" -H "Content-Type: application/json" -d "\${JSON_PAYLOAD}" > /dev/null
EOF2

chmod +x /root/premdigital_reporter.sh

# 3. Pasang Auto-Creator Service (Python Real Creator untuk SSH, VMess, VLESS, Trojan)
cat > /root/premdigital_creator.py << 'EOF_PY'
import urllib.request
import json
import subprocess
import time
import os
import datetime
import uuid

def load_config():
    config = {
        "PROJECT_ID": "${firebaseConfig.projectId}",
        "API_KEY": "${firebaseConfig.apiKey}",
        "SERVER_ID": "${selectedNodeId}"
    }
    if os.path.exists("/root/node_config.txt"):
        with open("/root/node_config.txt") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k == "NODE_ID":
                        config["SERVER_ID"] = v
                    elif k in ["PROJECT_ID", "API_KEY"]:
                        config[k] = v
    return config

CONF = load_config()
PROJECT_ID = CONF["PROJECT_ID"]
API_KEY = CONF["API_KEY"]
SERVER_ID = CONF["SERVER_ID"]

BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

print(f"[PREMDIGITAL-CREATOR] Dimulai untuk Node: {SERVER_ID} (Project: {PROJECT_ID})")

def get_pending_commands():
    url = f"{BASE_URL}/vps_commands?key={API_KEY}&pageSize=50"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode())
            commands = []
            for doc in res_data.get('documents', []):
                doc_id = doc['name'].split('/')[-1]
                fields = doc.get('fields', {})
                sid = fields.get('serverId', {}).get('stringValue', '')
                status = fields.get('status', {}).get('stringValue', '')
                
                if sid == SERVER_ID and status == 'pending':
                    act_days = 30
                    if 'activeDays' in fields:
                        f_days = fields['activeDays']
                        if 'integerValue' in f_days:
                            act_days = int(f_days['integerValue'])
                        elif 'stringValue' in f_days:
                            try:
                                act_days = int(f_days['stringValue'])
                            except:
                                act_days = 30
                    commands.append({
                        "id": doc_id,
                        "username": fields.get('username', {}).get('stringValue', ''),
                        "password": fields.get('password', {}).get('stringValue', ''),
                        "protocol": fields.get('protocol', {}).get('stringValue', 'ssh').lower(),
                        "uuid": fields.get('uuid', {}).get('stringValue', ''),
                        "activeDays": act_days
                    })
            return commands
    except Exception as e:
        print("[ERROR] Fetching commands:", e)
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
        with urllib.request.urlopen(req, timeout=10) as response:
            pass
    except Exception as e:
        print("[ERROR] Updating status:", e)

def create_ssh(username, password, days):
    if not username or not password:
        return False, "Username atau password kosong"
    try:
        exp_date = (datetime.date.today() + datetime.timedelta(days=int(days))).strftime("%Y-%m-%d")
        check = subprocess.run(f"id {username}", shell=True, capture_output=True, text=True)
        if check.returncode == 0:
            subprocess.run(f"usermod -e {exp_date} -s /bin/false {username}", shell=True, check=True)
        else:
            subprocess.run(f"useradd -e {exp_date} -s /bin/false -M {username}", shell=True, check=True)
        subprocess.run(f'echo "{username}:{password}" | chpasswd', shell=True, check=True)
        return True, f"Akun SSH {username} aktif s/d {exp_date}"
    except Exception as e:
        return False, str(e)

def create_xray(protocol, username, password, user_uuid, days):
    config_path = "/etc/xray/config.json"
    if not os.path.exists(config_path):
        return False, f"File config Xray tidak ditemukan di {config_path}"
    try:
        exp_date = (datetime.date.today() + datetime.timedelta(days=int(days))).strftime("%Y-%m-%d")
        final_uuid = user_uuid if user_uuid else str(uuid.uuid4())
        
        with open(config_path, "r") as f:
            data = json.load(f)
            
        inbounds = data.get("inbounds", [])
        added = False
        for ib in inbounds:
            proto = ib.get("protocol", "").lower()
            if proto == protocol.lower():
                settings = ib.setdefault("settings", {})
                clients = settings.setdefault("clients", [])
                clients = [c for c in clients if c.get("email") != username]
                if protocol.lower() == "trojan":
                    clients.append({"password": password or final_uuid, "email": username})
                elif protocol.lower() == "vmess":
                    clients.append({"id": final_uuid, "alterId": 0, "email": username})
                elif protocol.lower() == "vless":
                    clients.append({"id": final_uuid, "email": username})
                settings["clients"] = clients
                added = True
                
        if not added:
            return False, f"Inbound {protocol} tidak ditemukan di config Xray"
            
        with open(config_path, "w") as f:
            json.dump(data, f, indent=2)
            
        os.makedirs("/etc/premdigital", exist_ok=True)
        with open("/etc/premdigital/xray-users.db", "a") as f:
            f.write(f"{username} | {final_uuid} | {exp_date} | {protocol}\\n")
            
        subprocess.run("systemctl restart xray", shell=True)
        return True, f"Akun {protocol.upper()} {username} aktif s/d {exp_date}"
    except Exception as e:
        return False, str(e)

while True:
    commands = get_pending_commands()
    for cmd in commands:
        proto = cmd['protocol']
        u = cmd['username']
        p = cmd['password']
        days = cmd['activeDays']
        print(f"[MEMPROSES] {proto.upper()} untuk user '{u}' ({days} hari)...")
        
        if proto in ["ssh", "websocket"]:
            success, msg = create_ssh(u, p, days)
        elif proto in ["vmess", "vless", "trojan"]:
            success, msg = create_xray(proto, u, p, cmd['uuid'], days)
        else:
            success, msg = False, f"Protokol {proto} tidak dikenal"
            
        if success:
            print(f"[SUKSES] {msg}")
            update_command_status(cmd['id'], 'success', msg)
        else:
            print(f"[GAGAL] {msg}")
            update_command_status(cmd['id'], 'error', msg)
            
    time.sleep(5)
EOF_PY

# 4. Pasang systemd Service Auto-Creator
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

# 5. Pasang Cronjob Reporter (Tiap Menit) & Jalankan Segera
(crontab -l 2>/dev/null | grep -v "premdigital_reporter.sh"; echo "*/1 * * * * /bin/bash /root/premdigital_reporter.sh >/dev/null 2>&1") | crontab -
/bin/bash /root/premdigital_reporter.sh
echo "=== Script PremDigital Berhasil Dipasang & Berjalan ==="
`;



  const copyToClipboard = () => {

    navigator.clipboard.writeText(vpsInstallerScript);

    setCopiedScript(true);

    setTimeout(() => setCopiedScript(false), 3000);

  };

  if (userRole !== 'admin') return null;

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0f111a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-slate-400">Manage platform settings, pricing, statistics, and VPS integration.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <Settings className="w-4 h-4" />
              General Settings
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <BarChart2 className="w-4 h-4" />
              Platform Statistics
            </button>
            <button 
              onClick={() => setActiveTab('vps')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'vps' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <Terminal className="w-4 h-4" />
              VPS Script Connector
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <Users className="w-4 h-4" />
              Users & Topups
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <Server className="w-4 h-4" />
              Server Nodes
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#1e2335] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">General & Pricing Configuration</h2>
                
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  
                  {/* Pricing Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Premium Pricing (Rp / 30 Days)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">SSH Premium</label>
                        <input type="number" value={priceSsh} onChange={(e) => setPriceSsh(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">V2Ray Vmess</label>
                        <input type="number" value={priceVmess} onChange={(e) => setPriceVmess(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">V2Ray Vless</label>
                        <input type="number" value={priceVless} onChange={(e) => setPriceVless(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Trojan</label>
                        <input type="number" value={priceTrojan} onChange={(e) => setPriceTrojan(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Discount Percentage (%)</label>
                        <input type="number" value={premiumDiscount} onChange={(e) => setPremiumDiscount(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-700/50" />

                  {/* Free Account Rules */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Free Account Policies</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Free Account Limit (Total per server)</label>
                        <input type="number" value={freeLimit} onChange={(e) => setFreeLimit(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Free Account Reset Time (Schedule)</label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
                          <input type="time" value={resetTime} onChange={(e) => setResetTime(e.target.value)} className="w-full bg-[#13172a] border border-slate-600 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">The VPS bash script will read this schedule to automatically wipe ONLY Free Accounts.</p>
                  </div>

                  <hr className="border-slate-700/50" />

                  {/* Premium Account Rules */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Premium Account Policies</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Premium Account Limit (Total per server)</label>
                        <input type="number" value={premiumLimit} onChange={(e) => setPremiumLimit(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Premium accounts do NOT reset automatically. They are managed by expiration dates.</p>
                  </div>

                  <hr className="border-slate-700/50" />

                  {/* Cloudflare Turnstile Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Security & Verification</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Cloudflare Turnstile Site Key (Leave empty to disable)</label>
                        <input type="text" value={turnstileSiteKey} onChange={(e) => setTurnstileSiteKey(e.target.value)} placeholder="0x4AAAAAA..." className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Enable Cloudflare Turnstile CAPTCHA on account creation to prevent bots/spam. Get your Site Key from Cloudflare dashboard.</p>
                  </div>
                  
                  <hr className="border-slate-700/50" />
                  
                  {/* Payment Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Payment Configuration (QRIS)</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Link / URL Gambar QRIS</label>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              placeholder="https://example.com/qris.jpg" 
                              value={qrisUrl} 
                              onChange={(e) => {
                                let val = e.target.value;
                                if (val.includes("imgur.com/a/")) {
                                  const id = val.split("imgur.com/a/")[1].split("?")[0].split("/")[0];
                                  val = `https://i.imgur.com/${id}.jpg`;
                                } else if (val.includes("imgur.com/") && !val.includes("i.imgur.com/")) {
                                  const id = val.split("imgur.com/")[1].split("?")[0].split("/")[0];
                                  val = `https://i.imgur.com/${id}.jpg`;
                                }
                                setQrisUrl(val);
                              }} 
                              className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" 
                            />
                            <p className="text-[10px] text-slate-500 mt-2">Tempel (paste) link/URL gambar QRIS Anda di sini.</p>
                          </div>
                          {qrisUrl && (
                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-600 p-1">
                              <SafeImage src={qrisUrl} alt="QRIS Preview" className="w-full h-full object-contain rounded-lg" />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <label className="block text-xs font-bold text-emerald-400 mb-2">Atau Unggah Gambar dari HP (Otomatis & Anti-Error)</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 600;
                                  const MAX_HEIGHT = 600;
                                  let width = img.width;
                                  let height = img.height;
                                  
                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height *= MAX_WIDTH / width;
                                      width = MAX_WIDTH;
                                    }
                                  } else {
                                    if (height > MAX_HEIGHT) {
                                      width *= MAX_HEIGHT / height;
                                      height = MAX_HEIGHT;
                                    }
                                  }
                                  
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  
                                  // Compress to JPEG with 0.8 quality to ensure it fits in Firestore (1MB limit)
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                  setQrisUrl(dataUrl);
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    {saveSuccess ? (
                      <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
                      </span>
                    ) : <span></span>}
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* Platform Statistics Management Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Platform Statistics & Live Counters</h2>
                    <p className="text-xs text-slate-400">Atur atau sinkronkan data statistik yang muncul di halaman beranda.</p>
                  </div>
                  <button
                    onClick={handleResetCleanStats}
                    disabled={isSaving}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                    Reset ke 0 & Sinkronkan
                  </button>
                </div>

                <form onSubmit={handleSaveStats} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Active Servers (Server Aktif)</label>
                      <input type="number" value={activeServers} onChange={(e) => setActiveServers(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Services Today (Dibuat Hari Ini)</label>
                      <input type="number" value={servicesToday} onChange={(e) => setServicesToday(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Total Accounts (Total Semua Akun)</label>
                      <input type="number" value={totalAccounts} onChange={(e) => setTotalAccounts(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Online Users (User Terhubung)</label>
                      <input type="number" value={onlineUsers} onChange={(e) => setOnlineUsers(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>

                  <hr className="border-slate-700/50" />

                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Today's Service Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">SSH Count</label>
                      <input type="number" value={breakdownSsh} onChange={(e) => setBreakdownSsh(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Trojan Count</label>
                      <input type="number" value={breakdownTrojan} onChange={(e) => setBreakdownTrojan(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Vmess Count</label>
                      <input type="number" value={breakdownVmess} onChange={(e) => setBreakdownVmess(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Vless Count</label>
                      <input type="number" value={breakdownVless} onChange={(e) => setBreakdownVless(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    {saveSuccess ? (
                      <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Statistik berhasil diperbarui!
                      </span>
                    ) : <span></span>}
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Menyimpan...' : 'Simpan Statistik'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VPS Script Connector Tab */}
            {activeTab === 'vps' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">VPS Script Connector (Satu atau Banyak VPS)</h2>
                  <p className="text-xs text-slate-400">
                    Gunakan skrip bash ini di dalam terminal VPS Anda (Ubuntu/Debian). Bisa dipasang di 1 VPS atau banyak VPS sekaligus. Dashboard otomatis menghitung total server aktif dan total online user dari semua VPS Anda.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                  <strong>💡 Multi-VPS Otomatis:</strong> Setiap VPS yang menjalankan skrip ini akan memiliki Node ID unik. Dashboard otomatis menjumlahkan total online user dan menghitung jumlah <strong>Aktif Server</strong> secara real-time dari heartbeat VPS.
                </div>

                {/* VPS Node Configurator */}
                <div className="bg-[#13172a] border border-slate-700/60 rounded-xl p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-300">Konfigurasi Target Node VPS Ini:</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pastikan Domain / Host diisi sesuai subdomain / domain yang sudah Anda pointing (A Record) di Cloudflare ke IP VPS ini.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Node ID (Unik untuk tiap VPS)</label>
                      <input 
                        type="text" 
                        value={selectedNodeId} 
                        onChange={(e) => setSelectedNodeId(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                        className="w-full bg-[#0b0e1b] border border-slate-600 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. sg-vps-01, id-vps-02"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nama Server</label>
                      <input 
                        type="text" 
                        value={customNodeName} 
                        onChange={(e) => setCustomNodeName(e.target.value)} 
                        className="w-full bg-[#0b0e1b] border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. SG1 DigitalOcean"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Domain / Host (Pointing Cloudflare)</label>
                      <input 
                        type="text" 
                        value={customNodeDomain} 
                        onChange={(e) => setCustomNodeDomain(e.target.value.trim())} 
                        className="w-full bg-[#0b0e1b] border border-slate-600 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. sgdo-premdigital.web.id"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Lokasi / Kota</label>
                      <input 
                        type="text" 
                        value={customNodeCity} 
                        onChange={(e) => setCustomNodeCity(e.target.value)} 
                        className="w-full bg-[#0b0e1b] border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Singapore, Jakarta"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kode Negara</label>
                      <input 
                        type="text" 
                        value={customNodeCountryCode} 
                        onChange={(e) => setCustomNodeCountryCode(e.target.value.toUpperCase())} 
                        className="w-full bg-[#0b0e1b] border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        placeholder="SG, ID, US"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 items-center">
                    <span className="font-semibold text-slate-300">Preset Cepat:</span>
                    <button 
                      type="button"
                      onClick={() => { 
                        setSelectedNodeId('sg-premium-01'); 
                        setCustomNodeName('SG DigitalOcean'); 
                        setCustomNodeDomain('sgdo-premdigital.web.id');
                        setCustomNodeCity('Singapore'); 
                        setCustomNodeCountryCode('SG'); 
                      }} 
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Node SG (sgdo-premdigital.web.id)
                    </button>
                    <button 
                      type="button"
                      onClick={() => { 
                        setSelectedNodeId('id-biznet-01'); 
                        setCustomNodeName('ID1 Biznet'); 
                        setCustomNodeDomain('id1.premdigital.web.id');
                        setCustomNodeCity('Jakarta'); 
                        setCustomNodeCountryCode('ID'); 
                      }} 
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Node ID-1 (id1.premdigital.web.id)
                    </button>
                    <button 
                      type="button"
                      onClick={() => { 
                        setSelectedNodeId('sg-aws-02'); 
                        setCustomNodeName('SG2 Linode'); 
                        setCustomNodeDomain('sg2.premdigital.web.id');
                        setCustomNodeCity('Singapore'); 
                        setCustomNodeCountryCode('SG'); 
                      }} 
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Node SG-2
                    </button>
                    <button 
                      type="button"
                      onClick={() => { 
                        setSelectedNodeId('id-telkom-02'); 
                        setCustomNodeName('ID2 Telkom'); 
                        setCustomNodeDomain('id2.premdigital.web.id');
                        setCustomNodeCity('Surabaya'); 
                        setCustomNodeCountryCode('ID'); 
                      }} 
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Node ID-2
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#13172a] rounded-t-xl border border-slate-700 border-b-0">
                    <span className="text-xs font-mono text-slate-400">Install Worker & Reporter ({selectedNodeId})</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(vpsInstallerScript);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 3000);
                      }}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Tersalin!' : 'Salin Skrip'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-b-xl bg-[#0b0e1b] border border-slate-700 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
                    {vpsInstallerScript}
                  </pre>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <h4 className="font-bold text-white text-sm">Langkah Pemasangan di Terminal VPS:</h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                    <li>Buka terminal VPS Anda (Putty / Termius / SSH).</li>
                    <li>Salin (Copy) skrip instalasi di atas.</li>
                    <li>Tempelkan (Paste) di terminal lalu tekan Enter.</li>
                    <li>Tunggu proses instalasi selesai. Script ini akan otomatis memasang <strong className="text-white">Auto-Creator Daemon</strong> dan <strong className="text-white">Status Reporter</strong> sekaligus.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Manual Top Up & Users</h2>
                  <p className="text-xs text-slate-400">Kelola persetujuan Top Up saldo member secara manual dari sini.</p>
                </div>

                <div className="bg-[#13172a] border border-slate-700/60 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-700/60 bg-slate-800/20">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Pending Top Up Requests ({pendingTopups.length})
                    </h3>
                  </div>
                  
                  {pendingTopups.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-400">Belum ada antrean top up.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {pendingTopups.map((topup) => (
                        <div key={topup.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-white">{topup.userEmail}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase">
                                {topup.paymentMethod}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Top Up: <strong className="text-emerald-400 text-sm">Rp {topup.amount.toLocaleString()}</strong>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {new Date(topup.createdAt).toLocaleString('id-ID')}
                            </p>
                            {topup.proofUrl && (
                              <div className="mt-3">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">Bukti Transfer:</p>
                                <a href={topup.proofUrl} target="_blank" rel="noopener noreferrer">
                                  <div className="w-16 h-16 bg-black/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-indigo-500 transition-colors">
                                    <img src={topup.proofUrl} alt="Bukti Transfer" className="w-full h-full object-cover" />
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => handleApproveTopup(topup)}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button 
                              onClick={() => handleRejectTopup(topup)}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Connected VPS Nodes</h2>
                    <p className="text-xs text-slate-400">Node VPS yang terhubung dan melapor via skrip crontab secara real-time.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 animate-pulse" />
                    {vpsNodes.filter(n => n.status === 'Online').length} Online / {vpsNodes.length} Terdaftar
                  </span>
                </div>

                {vpsNodes.length === 0 ? (
                  <div className="py-12 px-6 rounded-2xl bg-[#13172a] border border-slate-700/60 text-center">
                    <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">Belum ada VPS yang terhubung</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      Silakan buka tab <strong>VPS Script Connector</strong>, salin skrip, dan pasang di terminal VPS Anda. Seketika skrip berjalan, node akan muncul otomatis di sini dan status server aktif akan bertambah!
                    </p>
                    <button 
                      onClick={() => setActiveTab('vps')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      Buka VPS Script Connector
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vpsNodes.map((node) => {
                      const displayDomain = node.domain || node.host || (node.id === 'sg-premium-01' || node.countryCode === 'SG' ? 'sgdo-premdigital.web.id' : `${node.id}.premdigital.web.id`);
                      const isEditing = editingNodeId === node.id;

                      return (
                        <div key={node.id} className="p-4 rounded-xl bg-[#13172a] border border-slate-700/60 flex flex-col justify-between space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{node.name}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${node.status === 'Online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                  {node.status}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{node.ip} • {node.city}, {node.countryCode}</div>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
                              ID: {node.id}
                            </span>
                          </div>

                          {/* Domain / Host Cloudflare Pointing Card */}
                          <div className="p-2.5 rounded-lg bg-[#0b0e1b] border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                                Host / Cloudflare Domain:
                              </span>
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNodeId(node.id);
                                    setEditingDomainValue(displayDomain);
                                  }}
                                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                >
                                  Ubah Domain
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-2 pt-1">
                                <input
                                  type="text"
                                  value={editingDomainValue}
                                  onChange={(e) => setEditingDomainValue(e.target.value.trim())}
                                  placeholder="e.g. sgdo-premdigital.web.id"
                                  className="w-full bg-[#13172a] border border-indigo-500 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNodeId(null)}
                                    className="px-2.5 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isUpdatingNodeDomain || !editingDomainValue}
                                    onClick={() => handleUpdateNodeDomain(node.id, editingDomainValue)}
                                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                                  >
                                    {isUpdatingNodeDomain ? 'Menyimpan...' : 'Simpan Domain'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-emerald-400 font-bold truncate">
                                  {displayDomain}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                                  Output SNI Active
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/40 text-center">
                            <div className="bg-[#0b0e1b] p-2 rounded-lg">
                              <div className="text-[10px] text-slate-400">Online Users</div>
                              <div className="text-sm font-bold text-indigo-400">{node.onlineUsers}</div>
                            </div>
                            <div className="bg-[#0b0e1b] p-2 rounded-lg">
                              <div className="text-[10px] text-slate-400">CPU Load</div>
                              <div className="text-sm font-bold text-cyan-400">{node.cpuLoad}%</div>
                            </div>
                            <div className="bg-[#0b0e1b] p-2 rounded-lg">
                              <div className="text-[10px] text-slate-400">RAM Used</div>
                              <div className="text-sm font-bold text-purple-400">{node.ramUsage}%</div>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between">
                            <span>SSH: {node.sshOnline || 0} | Xray: {node.xrayOnline || 0}</span>
                            <span>Hb: {new Date(node.lastHeartbeat).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
