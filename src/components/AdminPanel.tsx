import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, collection, onSnapshot, setDoc, updateDoc } from '../lib/firebase';
import { Settings, Users, Server, Clock, Save, ShieldAlert, CheckCircle2, BarChart2, Terminal, Copy, Check, RefreshCw, Cpu, HardDrive, Globe, Radio } from 'lucide-react';
import { SERVERS_LIST, INITIAL_STATS } from '../data/mockData';
import { firebaseConfig } from '../lib/firebaseConfig';
import { VpsNode } from '../types';
import { isNodeHeartbeatActive } from '../lib/serverSync';

interface AdminPanelProps {
  isDark: boolean;
  userRole: 'member' | 'admin';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isDark, userRole }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'services' | 'stats' | 'vps'>('settings');
  
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
  const [customNodeCity, setCustomNodeCity] = useState<string>('Singapore');
  const [customNodeCountryCode, setCustomNodeCountryCode] = useState<string>('SG');

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
CITY="${customNodeCity}"
COUNTRY_CODE="${customNodeCountryCode}"
PROJECT_ID="${firebaseConfig.projectId}"
API_KEY="${firebaseConfig.apiKey}"
EOF2

# 2. Buat script Auto-Reporter
cat > /root/premdigital_reporter.sh << 'EOF2'
#!/bin/bash
source /root/node_config.txt
if [ -z "\$REST_URL" ]; then
    REST_URL="https://firestore.googleapis.com/v1/projects/\${PROJECT_ID}/databases/(default)/documents/vps_nodes"
fi
SERVER_IP=\$(curl -s https://api.ipify.org || hostname -I | awk '{print \$1}')
[ -z "\$SERVER_IP" ] && SERVER_IP="127.0.0.1"
RAM_USAGE=\$(free | grep Mem | awk '{print int(\$3/\$2 * 100.0)}')
CPU_LOAD=\$(uptime | awk -F'load average:' '{ print \$2 }' | cut -d, -f1 | awk '{print int(\$1 * 100)}')
ONLINE_USERS=\$(netstat -tnpa 2>/dev/null | grep 'ESTABLISHED.*sshd' | wc -l)
JSON_PAYLOAD=\$(cat <<JSON
{
  "fields": {
    "name": { "stringValue": "\${NODE_NAME}" },
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
curl -s -X PATCH "\${REST_URL}/\${NODE_ID}?key=\${API_KEY}" -H "Content-Type: application/json" -d "\${JSON_PAYLOAD}" > /dev/null
EOF2

chmod +x /root/premdigital_reporter.sh


# 4. Pasang Auto-Creator Service (Python)
cat > /root/premdigital_creator.py << 'EOF_PY'
import urllib.request
import json
import subprocess
import time
import os

PROJECT_ID="${PROJECT_ID}"
API_KEY="${API_KEY}"
SERVER_ID="${NODE_ID}"

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


# 5. Pasang Cronjob (Reporter)
(crontab -l 2>/dev/null | grep -v "premdigital_reporter.sh"; echo "*/1 * * * * /root/premdigital_reporter.sh >/dev/null 2>&1") | crontab -
echo "VPS Script Berhasil Dipasang!"
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
                  <h3 className="text-sm font-bold text-indigo-300">Konfigurasi Target Node VPS Ini:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                      onClick={() => { setSelectedNodeId('sg-do-01'); setCustomNodeName('SG1 DigitalOcean'); setCustomNodeCity('Singapore'); setCustomNodeCountryCode('SG'); }} 
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Node SG-1
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setSelectedNodeId('id-biznet-01'); setCustomNodeName('ID1 Biznet'); setCustomNodeCity('Jakarta'); setCustomNodeCountryCode('ID'); }} 
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Node ID-1
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setSelectedNodeId('sg-aws-02'); setCustomNodeName('SG2 Linode'); setCustomNodeCity('Singapore'); setCustomNodeCountryCode('SG'); }} 
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Node SG-2
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setSelectedNodeId('id-telkom-02'); setCustomNodeName('ID2 Telkom'); setCustomNodeCity('Surabaya'); setCustomNodeCountryCode('ID'); }} 
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
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <Users className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">User Management</h3>
                <p className="text-slate-400 text-sm max-w-sm">This module allows you to view registered users, edit their balances manually, and approve pending topups. Connected to Firestore collections.</p>
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
                    {vpsNodes.map((node) => (
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
                    ))}
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
