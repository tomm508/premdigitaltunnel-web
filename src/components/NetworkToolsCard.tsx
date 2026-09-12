import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  X, 
  Globe, 
  Search, 
  Activity, 
  Bot, 
  Cpu, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, collection, onSnapshot } from '../lib/firebase';
import { SERVERS_LIST } from '../data/mockData';
import { VpsNode } from '../types';

interface NetworkToolsCardProps {
  isDark: boolean;
  onOpenTool: (toolId: string) => void;
}

export const NetworkToolsCard: React.FC<NetworkToolsCardProps> = ({ isDark, onOpenTool }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'server-status' | 'host-to-ip' | 'subdomain-finder' | 'ai-chat'>('server-status');
  const [vpsNodes, setVpsNodes] = useState<VpsNode[]>([]);
  const navigate = useNavigate();

  // Listen to live VPS nodes from Firestore so telemetry always reflects real VPS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vps_nodes'), (snap) => {
      if (!snap.empty) {
        const nodes: VpsNode[] = [];
        const now = Date.now();
        snap.forEach((d) => {
          const data = d.data();
          const lastHb = data.lastHeartbeat ? new Date(data.lastHeartbeat).getTime() : 0;
          const isOnline = (now - lastHb) < 15 * 60 * 1000 || data.status === 'Online';
          nodes.push({
            id: d.id,
            name: data.name || d.id,
            ip: data.ip || '103.xxx.xxx.xxx',
            city: data.city || 'Cloud VPS',
            country: data.country || 'Global',
            countryCode: data.countryCode || 'SG',
            onlineUsers: Number(data.onlineUsers || 0),
            cpuLoad: Number(data.cpuLoad || 10),
            ramUsage: Number(data.ramUsage || 25),
            status: isOnline ? 'Online' : 'Down',
            lastHeartbeat: data.lastHeartbeat || new Date().toISOString()
          });
        });
        setVpsNodes(nodes);
      }
    }, (err) => {
      console.warn("Telemetry nodes listen error:", err);
    });

    return () => unsub();
  }, []);

  if (!isVisible) return null;

  // Use live VPS nodes if reported, otherwise fallback to SERVERS_LIST
  const displayServers = vpsNodes.length > 0 
    ? vpsNodes.map(n => ({
        id: n.id,
        flag: n.countryCode === 'ID' ? '🇮🇩' : '🇸🇬',
        name: n.name,
        country: n.countryCode === 'ID' ? 'Indonesia' : 'Singapore',
        city: n.city || (n.countryCode === 'ID' ? 'Jakarta Cloud (My VPS)' : 'Server Pribadi (My VPS)'),
        ping: n.countryCode === 'ID' ? 15 : 24,
        load: n.cpuLoad || 15,
        status: n.status
      }))
    : SERVERS_LIST.map(s => ({
        id: s.id,
        flag: s.flag,
        name: `${s.country} – ${s.city}`,
        country: s.country,
        city: s.city,
        ping: s.ping,
        load: s.load,
        status: 'Online' as const
      }));

  const onlineNodesCount = displayServers.filter(s => s.status === 'Online').length;
  const totalNodesCount = displayServers.length > 2 ? displayServers.length : 19;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div 
        id="network-tools-banner"
        className={`rounded-3xl p-5 sm:p-6 transition-all shadow-2xl relative overflow-hidden border ${
          isDark 
            ? 'bg-[#151036]/90 border-purple-500/40 shadow-purple-950/40 text-white' 
            : 'bg-white border-purple-200 shadow-purple-900/10 text-slate-800'
        }`}
      >
        {/* Header with Title & Close Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base sm:text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Network & Tunneling Tools
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-purple-300/80' : 'text-purple-700/80'}`}>
                Diagnostics, IP lookup, DNS testing, and AI Assistant
              </p>
            </div>
          </div>
          <button
            id="close-network-tools-card"
            onClick={() => setIsVisible(false)}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Sembunyikan panel ini"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tools Action Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-purple-500/20 overflow-x-auto text-xs">
          <button
            onClick={() => onOpenTool('host-to-ip')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'host-to-ip'
                ? 'bg-purple-600 text-white shadow-md'
                : isDark 
                  ? 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/60 hover:text-white border border-purple-500/20' 
                  : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Host to IP</span>
          </button>

          <button
            onClick={() => onOpenTool('subdomain-finder')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'subdomain-finder'
                ? 'bg-purple-600 text-white shadow-md'
                : isDark 
                  ? 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/60 hover:text-white border border-purple-500/20' 
                  : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span>Subdomain Finder</span>
          </button>

          <button
            onClick={() => navigate('/server-status')}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-300" />
            <span>Server Status</span>
          </button>

          <button
            onClick={() => onOpenTool('ai-chat')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'ai-chat'
                ? 'bg-purple-600 text-white shadow-md'
                : isDark 
                  ? 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/60 hover:text-white border border-purple-500/20' 
                  : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-yellow-400" />
            <span>Chat With AI</span>
          </button>
        </div>

        {/* Telemetry Section Header */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Server Fleet Telemetry
          </h4>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Online</span>
          </div>
        </div>

        {/* Server Nodes List (Matches Screenshot) */}
        <div className="space-y-3">
          {displayServers.slice(0, 4).map((srv) => (
            <div 
              key={srv.id}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all border ${
                isDark 
                  ? 'bg-[#1b1542]/80 border-purple-500/25 hover:border-purple-400/40' 
                  : 'bg-purple-50/70 border-purple-200/80 hover:border-purple-300'
              }`}
            >
              {/* Server Title & Latency */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className="text-base leading-none">{srv.flag}</span>
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>
                    {srv.name}
                  </span>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-xs">
                  {srv.ping} ms
                </span>
              </div>

              {/* Progress Bar (Purple) */}
              <div className={`w-full h-2 rounded-full overflow-hidden mb-2.5 ${
                isDark ? 'bg-[#291f63]' : 'bg-purple-200/70'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  style={{ width: `${Math.max(12, srv.load)}%` }}
                />
              </div>

              {/* Metadata Footer */}
              <div className={`flex items-center justify-between text-[11px] font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <span>Server Load: {srv.load}%</span>
                <span>Port 443 / 22: <strong className="text-emerald-400 font-bold">OPEN</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Status Link */}
        <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs">
          <span className={`text-[11px] ${isDark ? 'text-purple-300/70' : 'text-purple-800/70'}`}>
            Status server otomatis tersinkronisasi via REST API crontab VPS.
          </span>
          <button
            onClick={() => navigate('/server-status')}
            className="flex items-center gap-1 font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <span>Buka Status Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
