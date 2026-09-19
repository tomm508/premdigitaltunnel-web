import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles,
  Zap,
  ShieldCheck,
  Star,
  Globe,
  AlertTriangle,
  XCircle,
  X
} from 'lucide-react';
import { ProtocolType, TunnelServer, VpsNode } from '../types';
import { SERVERS_LIST } from '../data/mockData';
import { subscribeVpsNodes, UnifiedServerNode } from '../lib/serverSync';
import { db, doc, onSnapshot } from '../lib/firebase';

interface FreeTunnelingProps {
  isDark: boolean;
  onSelectServer: (protocol: ProtocolType, server: TunnelServer) => void;
  onBack: () => void;
}

export const FreeTunneling: React.FC<FreeTunnelingProps> = ({
  isDark,
  onSelectServer,
  onBack
}) => {
  const [activeProtocol, setActiveProtocol] = useState<ProtocolType>('ssh');
  const [freeLimit, setFreeLimit] = useState(10);
  const [liveServers, setLiveServers] = useState<UnifiedServerNode[]>(() => 
    SERVERS_LIST.map(s => ({ ...s, status: 'Down' as const }))
  );
  const [fullServerNotice, setFullServerNotice] = useState<{
    serverName: string;
    used: number;
    limit: number;
  } | null>(null);

  // Subscribe to settings for limit
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFreeLimit(data.freeAccountLimit || 10);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time VPS heartbeats
  useEffect(() => {
    const unsub = subscribeVpsNodes((servers) => {
      setLiveServers(servers);
    });
    return () => unsub();
  }, []);

  // Filter for Free servers in SG & ID only
  const freeServers = liveServers.filter(s => 
    !s.isVip && (s.supportedProtocols || []).includes(activeProtocol)
  );

  const tabs: { id: ProtocolType; label: string }[] = [
    { id: 'ssh', label: 'SSH Tunnel' },
    { id: 'vmess', label: 'Vmess' },
    { id: 'vless', label: 'Vless' },
    { id: 'trojan', label: 'Trojan' }
  ];

  return (
    <div className={`pt-24 pb-20 min-h-screen ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-8 transition-all ${
            isDark 
              ? 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60 border border-purple-500/30' 
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 shadow-inner ${
            isDark 
              ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300' 
              : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free Accounts</span>
          </div>
          <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Start Free Tunneling
          </h1>
          <p className={`text-[15px] max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Create Free 24-Hours SSH, Vmess, Vless, and Trojan accounts instantly. Our free servers are located in Singapore (SG) and Indonesia (ID) for optimal latency.
          </p>
        </div>

        {/* Protocol Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProtocol(tab.id)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
                activeProtocol === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-600/30 border border-transparent'
                  : isDark
                    ? 'bg-[#1b1542] text-slate-400 border border-purple-900/50 hover:bg-[#20194e] hover:text-purple-300'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {freeServers.length > 0 ? (
            freeServers.map((server) => {
              const currentUsed = Math.max(0, server.usedSlots || 0);
              const isFull = currentUsed >= freeLimit;

              return (
                <div 
                  key={server.id}
                  className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                    isDark 
                      ? 'bg-[#15112e] border-[#2a234f] hover:border-purple-500/50' 
                      : 'bg-white border-slate-200 hover:border-purple-300 shadow-xl shadow-purple-900/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl filter drop-shadow-md">{server.flag}</div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {server.country} Server
                        </h3>
                        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {server.city} • {server.host}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                      isDark ? 'bg-purple-900/30 text-purple-300 border-purple-500/20' : 'bg-purple-100 text-purple-700 border-purple-200'
                    }`}>
                      <Star className="w-3 h-3 fill-current" />
                      Free 3-Day
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className={`p-3 rounded-2xl text-center transition-colors ${
                      isFull 
                        ? 'bg-rose-950/40 border border-rose-500/40' 
                        : isDark ? 'bg-[#1b1542]' : 'bg-slate-50'
                    }`}>
                       <div className={`text-xs font-semibold mb-1 flex items-center justify-center gap-1 ${
                         isFull ? 'text-rose-400 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
                       }`}>
                         Limit
                         {isFull && <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/30 text-rose-300 font-bold uppercase">Full</span>}
                       </div>
                       <div className={`font-bold ${
                         isFull ? 'text-rose-400' : isDark ? 'text-white' : 'text-slate-900'
                       }`}>
                         {Math.min(currentUsed, freeLimit)}/{freeLimit}
                       </div>
                    </div>
                    <div className={`p-3 rounded-2xl text-center ${isDark ? 'bg-[#1b1542]' : 'bg-slate-50'}`}>
                       <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ping</div>
                       <div className={`font-bold ${server.status === 'Online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                         {server.status === 'Online' ? `${server.ping}ms` : 'Timeout'}
                       </div>
                    </div>
                    <div className={`p-3 rounded-2xl text-center ${isDark ? 'bg-[#1b1542]' : 'bg-slate-50'}`}>
                       <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</div>
                       {server.status === 'Online' ? (
                         <div className="font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           Active
                         </div>
                       ) : (
                         <div className="font-bold text-rose-400 flex items-center justify-center gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                           Offline
                         </div>
                       )}
                    </div>
                  </div>

                  {server.status !== 'Online' ? (
                    <button 
                      disabled
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-400 bg-slate-700/60 border border-rose-500/30 cursor-not-allowed opacity-80 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Server Offline
                    </button>
                  ) : isFull ? (
                    <button 
                      onClick={() => setFullServerNotice({
                        serverName: `${server.country} (${server.host})`,
                        used: currentUsed,
                        limit: freeLimit
                      })}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-rose-200 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/30 cursor-pointer active:scale-95"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Server Full ({Math.min(currentUsed, freeLimit)}/{freeLimit})
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSelectServer(activeProtocol, server)}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                      Generate {tabs.find(t => t.id === activeProtocol)?.label}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className={`col-span-full p-12 text-center rounded-3xl border ${isDark ? 'bg-[#15112e] border-[#2a234f]' : 'bg-slate-50 border-slate-200'}`}>
              <Globe className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No free servers available for {tabs.find(t => t.id === activeProtocol)?.label} at the moment.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Server Full Alert Modal */}
      {fullServerNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
            isDark ? 'bg-[#171233] border-rose-500/40 text-white' : 'bg-white border-rose-200 text-slate-900'
          }`}>
            <button
              onClick={() => setFullServerNotice(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-center mb-2 text-rose-400">
              Server Full ({fullServerNotice.used}/{fullServerNotice.limit})
            </h3>

            <p className={`text-sm text-center mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Mohon maaf, kuota pembuatan akun gratis untuk <strong>{fullServerNotice.serverName}</strong> hari ini sudah penuh mencapai batas <strong>{fullServerNotice.limit}/{fullServerNotice.limit}</strong>.
            </p>

            <div className={`p-3 rounded-2xl mb-6 text-xs text-center border ${
              isDark ? 'bg-purple-950/40 border-purple-800/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
            }`}>
              💡 <em>Tips:</em> Silakan pilih node server lain yang kuotanya masih tersedia, atau gunakan layanan VIP/Premium untuk akses tanpa batas.
            </div>

            <button
              onClick={() => setFullServerNotice(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
            >
              Pilih Server Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
