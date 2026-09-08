import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  Server, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { TunnelServer } from '../types';
import { SERVERS_LIST } from '../data/mockData';

interface SshServerListProps {
  isDark: boolean;
  onSelectServer: (server: TunnelServer) => void;
  onBack: () => void;
}

export const SshServerList: React.FC<SshServerListProps> = ({
  isDark,
  onSelectServer,
  onBack
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ID' | 'SG'>('all');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 5,
    minutes: 42,
    seconds: 18
  });

  // Calculate countdown to next 12:00 reset
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const nextResetHour = currentHour < 12 ? 12 : 24;
      const target = new Date(now);
      target.setHours(nextResetHour, 0, 0, 0);
      
      const diffMs = target.getTime() - now.getTime();
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sshServers = SERVERS_LIST.filter(s => s.supportedProtocols.includes('ssh'));
  const filteredServers = activeFilter === 'all' 
    ? sshServers 
    : sshServers.filter(s => s.countryCode === activeFilter);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Bar Back & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          Step 2 of 3: Pilih Server
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>High Performance VPS Cluster</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
          Select SSH Tunnel Server
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl mx-auto mt-2">
          Pilih lokasi server SSH terbaik. Dilengkapi port WebSocket CDN, Dropbear, dan SSH UDP Custom.
        </p>

        {/* Reset Countdown Timer */}
        <div className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#140e32] border border-purple-500/30 shadow-xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Reset Time: <strong className="text-white">12:00 PM & 12:00 AM</strong></span>
          </div>
          <div className="h-4 w-px bg-purple-500/30" />
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
            <span>{format2(timeLeft.hours)}</span>:
            <span>{format2(timeLeft.minutes)}</span>:
            <span>{format2(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>

      {/* Country Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
              : 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/40 border border-purple-500/20'
          }`}
        >
          🌐 Semua Server ({sshServers.length})
        </button>
        <button
          onClick={() => setActiveFilter('ID')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === 'ID'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
              : 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/40 border border-purple-500/20'
          }`}
        >
          <span>🇮🇩</span>
          <span>SSH Tunnel Indonesia</span>
        </button>
        <button
          onClick={() => setActiveFilter('SG')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === 'SG'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
              : 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/40 border border-purple-500/20'
          }`}
        >
          <span>🇸🇬</span>
          <span>SSH Tunnel Singapore</span>
        </button>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServers.map((server, idx) => {
          const limitCreated = server.limitCreated ?? 60;
          const leftCreated = server.leftCreated ?? (server.totalSlots - server.usedSlots);
          const freeDays = server.freeActiveDays ?? 3;

          return (
            <div
              key={server.id}
              className="group rounded-3xl bg-[#151036] border border-purple-500/20 hover:border-purple-400/50 p-6 transition-all duration-200 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{server.flag}</span>
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                        SSH Tunnel {server.country} {idx + 1}
                      </h3>
                      <p className="text-xs text-purple-300/70 font-mono">
                        {server.city}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {server.ping}ms
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block">Free Days</span>
                    <span className="text-xs font-bold text-white">{freeDays} Hari</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block">Limit Hari Ini</span>
                    <span className="text-xs font-bold text-white">{limitCreated}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/20 text-center">
                    <span className="text-[10px] text-slate-400 block">Sisa Kuota</span>
                    <span className="text-xs font-bold text-emerald-400">{leftCreated}</span>
                  </div>
                </div>

                {/* Pricing Badges */}
                <div className="py-2 space-y-1.5 text-xs text-slate-300 border-t border-b border-purple-500/20 my-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Gratis Trial:</span>
                    <span className="font-bold text-emerald-400">Rp 0 (3 Hari)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Paket 7 Hari VIP:</span>
                    <span className="font-semibold text-purple-300">Rp 5.000</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Paket 30 Hari VIP:</span>
                    <span className="font-semibold text-purple-300">Rp 15.000</span>
                  </div>
                </div>

                {/* Device Limit Warning */}
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 mb-4">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Maksimal 2 device aktif per akun</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectServer(server)}
                className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02]"
              >
                <span>Pilih Server Ini</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
