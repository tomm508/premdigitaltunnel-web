import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target1 = `import { Settings, Users, Server, Clock, Save, ShieldAlert, CheckCircle2, BarChart2, Terminal, Copy, Check, RefreshCw, Cpu, HardDrive, Globe, Radio } from 'lucide-react';`;
const replacement1 = `import { Settings, Users, Server, Clock, Save, ShieldAlert, CheckCircle2, BarChart2, Terminal, Copy, Check, RefreshCw, Cpu, HardDrive, Globe, Radio, X } from 'lucide-react';`;

// Update state and useEffect
const target2 = `  const [activeTab, setActiveTab] = useState<'settings' | 'vps' | 'users' | 'services'>('settings');
  const [isSaving, setIsSaving] = useState(false);`;

const replacement2 = `  const [activeTab, setActiveTab] = useState<'settings' | 'vps' | 'users' | 'services'>('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);

  // Fetch pending topups
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'topups'), (snapshot) => {
      const topups = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((t: any) => t.status === 'waiting_verification')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingTopups(topups);
    });
    return () => unsub();
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
      await setDoc(doc(db, 'topups', topup.id), {
        status: 'success',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      alert('Top Up sebesar Rp ' + topup.amount + ' berhasil disetujui.');
    } catch (err) {
      console.error(err);
      alert('Gagal menyetujui top up.');
    }
  };

  const handleRejectTopup = async (topupId: string) => {
    if (confirm('Anda yakin ingin menolak Top Up ini?')) {
      try {
        await setDoc(doc(db, 'topups', topupId), {
          status: 'rejected',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error(err);
      }
    }
  };`;

// Update users tab view
const target3 = `            {activeTab === 'users' && (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <Users className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">User Management</h3>
                <p className="text-slate-400 text-sm max-w-sm">This module allows you to view registered users, edit their balances manually, and approve pending topups. Connected to Firestore collections.</p>
              </div>
            )}`;

const replacement3 = `            {activeTab === 'users' && (
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
                          <div>
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
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => handleApproveTopup(topup)}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button 
                              onClick={() => handleRejectTopup(topup.id)}
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
            )}`;

if (code.includes(target2)) {
  code = code.replace(target1, replacement1);
  code = code.replace(target2, replacement2);
  code = code.replace(target3, replacement3);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log("Patched AdminPanel.tsx successfully!");
} else {
  console.log("Could not find target2 in AdminPanel.tsx");
}
