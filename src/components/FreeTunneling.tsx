import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles,
  Zap,
  ShieldCheck,
  Star,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { ProtocolType, TunnelServer, VpsNode } from '../types';
import { SERVERS_LIST } from '../data/mockData';
import { subscribeVpsNodes, UnifiedServerNode } from '../lib/serverSync';

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
  const [liveServers, setLiveServers] = useState<UnifiedServerNode[]>(() => 
    SERVERS_LIST.map(s => ({ ...s, status: 'Down' as const }))
  );

  // Subscribe to real-time VPS heartbeats
  useEffect(() => {
    const unsub = subscribeVpsNodes((servers) => {
      setLiveServers(servers);
    });
    return () => unsub();
  }, []);

  // Filter for Free servers in SG & ID only
  const freeServers = liveServers.filter(s => 
    !s.isVip && (s.countryCode === 'SG' || s.countryCode === 'ID') && s.supportedProtocols.includes(activeProtocol)
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
            Create Free 3-Day SSH, Vmess, Vless, and Trojan accounts instantly. Our free servers are located in Singapore (SG) and Indonesia (ID) for optimal latency.
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
            freeServers.map((server) => (
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
                  <div className={`p-3 rounded-2xl text-center ${isDark ? 'bg-[#1b1542]' : 'bg-slate-50'}`}>
                     <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Limit</div>
                     <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{server.leftCreated}/{server.limitCreated}</div>
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

                <button 
                  onClick={() => onSelectServer(activeProtocol, server)}
                  disabled={server.status !== 'Online'}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                    server.status === 'Online'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20 cursor-pointer'
                      : 'bg-slate-700/60 text-slate-400 border border-rose-500/30 cursor-not-allowed opacity-80'
                  }`}
                >
                  {server.status === 'Online' ? (
                    <>
                      <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                      Generate {tabs.find(t => t.id === activeProtocol)?.label}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Server Offline (Node Belum Aktif)
                    </>
                  )}
                </button>
              </div>
            ))
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
    </div>
  );
};
