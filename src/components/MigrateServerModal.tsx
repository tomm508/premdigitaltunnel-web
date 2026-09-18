import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  X, 
  Repeat, 
  Server, 
  Check, 
  Copy, 
  ArrowRight, 
  Shield, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { TunnelServer, UserServiceAccount } from '../types';
import { SERVERS_LIST } from '../data/mockData';
import { subscribeVpsNodes, UnifiedServerNode } from '../lib/serverSync';
import { db, doc, updateDoc, addDoc, collection } from '../lib/firebase';

interface MigrateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserServiceAccount | null;
  currentUser: User | null;
  onMigrationSuccess: (updatedAccount: UserServiceAccount) => void;
}

export const MigrateServerModal: React.FC<MigrateServerModalProps> = ({
  isOpen,
  onClose,
  account,
  currentUser,
  onMigrationSuccess
}) => {
  const [availableServers, setAvailableServers] = useState<UnifiedServerNode[]>([]);
  const [selectedTargetServer, setSelectedTargetServer] = useState<TunnelServer | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migratedAccount, setMigratedAccount] = useState<UserServiceAccount | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !account) {
      setSelectedTargetServer(null);
      setMigratedAccount(null);
      return;
    }

    // Subscribe to live servers
    const unsub = subscribeVpsNodes((nodes) => {
      setAvailableServers(nodes);
      // Auto-select first different server
      const firstOther = nodes.find(s => s.id !== account.server.id) || null;
      setSelectedTargetServer(firstOther);
    });

    return () => unsub();
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  // Calculate remaining days
  const now = new Date().getTime();
  const expTime = new Date(account.expiredAt).getTime();
  const remainingDays = Math.max(1, Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteMigration = async () => {
    if (!currentUser || !account || !selectedTargetServer) return;

    setIsMigrating(true);
    try {
      const targetHost = selectedTargetServer.domain || selectedTargetServer.host;
      const targetIp = selectedTargetServer.ip;

      // Regenerate config string for target server
      let newConfigString = '';
      let newPayloadString = '';
      const u = account.username;
      const p = account.password || '123456';
      const uuid = account.uuid || '';

      if (account.protocol === 'ssh') {
        newConfigString = `Host / Domain : ${targetHost}\nIP Address    : ${targetIp}\nPort OpenSSH  : 22\nPort Dropbear : 109, 143\nPort SSL/TLS  : 443\nPort WS (CDN) : 80, 8080\nPayload WS    : GET / HTTP/1.1[crlf]Host: ${targetHost}[crlf]Upgrade: websocket[crlf][crlf]\nUsername      : ${u}\nPassword      : ${p}\nExpired       : ${account.expiredAt}`;
        newPayloadString = `GET / HTTP/1.1[crlf]Host: [host_port][crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]`;
      } else if (account.protocol === 'vmess') {
        const vmessObj = {
          v: "2",
          ps: `PremDigital-${selectedTargetServer.country}-${u}`,
          add: targetHost,
          port: "443",
          id: uuid,
          aid: "0",
          net: "ws",
          path: "/vmess",
          type: "none",
          host: targetHost,
          tls: "tls"
        };
        newConfigString = `vmess://${btoa(JSON.stringify(vmessObj))}`;
      } else if (account.protocol === 'vless') {
        newConfigString = `vless://${uuid}@${targetHost}:443?path=%2Fvless&security=tls&encryption=none&type=ws&sni=${targetHost}#PremDigital-${selectedTargetServer.country}-${u}`;
      } else if (account.protocol === 'trojan') {
        newConfigString = `trojan://${p || uuid}@${targetHost}:443?security=tls&sni=${targetHost}&type=ws&path=%2Ftrojan#PremDigital-${selectedTargetServer.country}-${u}`;
      }

      // 1. Send VPS Command to target VPS to create user
      await addDoc(collection(db, 'vps_commands'), {
        serverId: selectedTargetServer.id,
        action: 'CREATE_ACCOUNT',
        protocol: account.protocol,
        username: u,
        password: p,
        uuid: uuid,
        activeDays: remainingDays,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // 2. Update account document in Firestore
      const accRef = doc(db, 'users', currentUser.uid, 'accounts', account.id);
      const updatedData: Partial<UserServiceAccount> = {
        server: selectedTargetServer,
        configString: newConfigString,
        payloadString: newPayloadString
      };
      await updateDoc(accRef, updatedData);

      // 3. Log transaction
      await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
        type: 'server_migration',
        title: `Pindah Server ${account.protocol.toUpperCase()}`,
        description: `Pindah dari ${account.server.country} (${account.server.city}) ke ${selectedTargetServer.country} (${selectedTargetServer.city})`,
        amount: 0,
        status: 'success',
        paymentMethod: 'Gratis',
        createdAt: new Date().toISOString(),
        protocol: account.protocol,
        serverName: selectedTargetServer.country
      });

      const finalUpdatedAccount: UserServiceAccount = {
        ...account,
        server: selectedTargetServer,
        configString: newConfigString,
        payloadString: newPayloadString
      };

      setMigratedAccount(finalUpdatedAccount);
      onMigrationSuccess(finalUpdatedAccount);
    } catch (err: any) {
      console.error(err);
      alert('Gagal memindahkan server: ' + (err.message || 'Error'));
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121624] border border-slate-700/70 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#161b2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Pindah Server VPN
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  GRATIS 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pindahkan akun Anda ke server lain kapan saja tanpa biaya & tanpa mengurangi masa aktif
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {migratedAccount ? (
            /* Success State */
            <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Pindah Server Berhasil!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Akun <strong className="text-purple-300">{migratedAccount.username}</strong> berhasil dipindahkan ke server <strong className="text-white">{migratedAccount.server.country} ({migratedAccount.server.city})</strong>.
                </p>
              </div>

              {/* Updated Server Badge */}
              <div className="bg-[#181d2f] border border-slate-800 rounded-xl p-4 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{migratedAccount.server.flag}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{migratedAccount.server.country} - {migratedAccount.server.city}</div>
                      <div className="text-[11px] font-mono text-emerald-400">{migratedAccount.server.domain || migratedAccount.server.host}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300">
                    {migratedAccount.protocol.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Host / SNI:</span>
                    <span className="text-white">{migratedAccount.server.domain || migratedAccount.server.host}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IP Address:</span>
                    <span className="text-white">{migratedAccount.server.ip}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Username:</span>
                    <span className="text-emerald-400">{migratedAccount.username}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Masa Aktif:</span>
                    <span className="text-amber-400">{remainingDays} Hari Lagi</span>
                  </div>
                </div>

                {migratedAccount.configString && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1 text-[11px] text-slate-400">
                      <span>Config Baru:</span>
                      <button
                        onClick={() => handleCopy(migratedAccount.configString || '', 'new-cfg')}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'new-cfg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Salin Config
                      </button>
                    </div>
                    <pre className="bg-[#0f111a] border border-slate-700/80 rounded-lg p-2.5 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-32">
                      {migratedAccount.configString}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Selesai & Kembali
                </button>
              </div>
            </div>
          ) : (
            /* Selection & Confirmation Flow */
            <>
              {/* Comparison Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Current Server */}
                <div className="bg-[#181d2f] border border-slate-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    SERVER SAAT INI
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{account.server.flag}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{account.server.country}</h4>
                      <p className="text-[11px] text-slate-400">{account.server.city}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                    <div>Host: <span className="text-slate-200">{account.server.domain || account.server.host}</span></div>
                    <div>User: <span className="text-emerald-400">{account.username}</span></div>
                    <div>Sisa: <span className="text-amber-400">{remainingDays} Hari</span></div>
                  </div>
                </div>

                {/* Target Server */}
                <div className="bg-[#181d2f] border border-purple-500/40 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
                    TUJUAN
                  </div>
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                    SERVER TUJUAN
                  </span>
                  {selectedTargetServer ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{selectedTargetServer.flag}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{selectedTargetServer.country}</h4>
                          <p className="text-[11px] text-slate-400">{selectedTargetServer.city}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                        <div>Host: <span className="text-emerald-400">{selectedTargetServer.domain || selectedTargetServer.host}</span></div>
                        <div>Ping: <span className="text-emerald-400">{selectedTargetServer.ping}ms</span></div>
                        <div>Biaya: <span className="text-emerald-400 font-bold">Rp 0 (GRATIS)</span></div>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 py-4 text-center">
                      Pilih server tujuan di bawah
                    </div>
                  )}
                </div>
              </div>

              {/* Server Selection Grid */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span>Pilih Server Tujuan Baru:</span>
                  <span className="text-[11px] text-purple-400 font-normal">Tersedia {availableServers.length} Server</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {availableServers.map((server) => {
                    const isCurrent = server.id === account.server.id;
                    const isSelected = selectedTargetServer?.id === server.id;

                    return (
                      <button
                        key={server.id}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => setSelectedTargetServer(server)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isCurrent
                            ? 'opacity-40 bg-[#0f111a] border-slate-800 cursor-not-allowed'
                            : isSelected
                            ? 'bg-purple-900/30 border-purple-500 shadow-md shadow-purple-900/20'
                            : 'bg-[#181d2f] border-slate-800 hover:border-slate-700 hover:bg-[#1d2238]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{server.flag}</span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              {server.country} - {server.city}
                              {isCurrent && (
                                <span className="text-[9px] text-slate-400 font-normal">(Saat Ini)</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                              {server.domain || server.host}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-emerald-400 block">
                            {server.ping}ms
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            Load {server.load}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guarantees Note */}
              <div className="bg-[#181d2f] border border-indigo-500/20 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed text-[11px]">
                  <p className="font-semibold text-white">Jaminan Pindah Server PremDigital:</p>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                    <li>Username, password, dan protokol tetap sama.</li>
                    <li>Sisa masa aktif (<strong className="text-amber-300">{remainingDays} hari</strong>) otomatis terbawa secara penuh.</li>
                    <li>Akun di server lama otomatis dipindahkan ke server baru secara instan.</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedTargetServer || selectedTargetServer.id === account.server.id || isMigrating}
                  onClick={handleExecuteMigration}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMigrating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memindahkan Server...
                    </>
                  ) : (
                    <>
                      <Repeat className="w-4 h-4" />
                      Konfirmasi Pindah ke {selectedTargetServer?.country || 'Server Baru'} (Gratis)
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#161b2e] flex items-center justify-between text-xs text-slate-400">
          <span>Protokol: {account.protocol.toUpperCase()} • User: {account.username}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
