import React from 'react';
import { Server, Zap, FileText, Users, Activity } from 'lucide-react';
import { PlatformStat } from '../types';

interface StatisticsProps {
  stats: PlatformStat;
  isDark: boolean;
}

export const Statistics: React.FC<StatisticsProps> = ({ stats, isDark }) => {
  return (
    <section id="statistics" className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 shadow-inner ${
            isDark 
              ? 'bg-purple-950/70 border border-purple-500/30 text-purple-300' 
              : 'bg-purple-100 border border-purple-300 text-purple-800'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Statistics</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Platform Statistics
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Real-time statistics of our VPN and SSH tunneling platform
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="space-y-4 mb-8">
          {/* Active Servers */}
          <div 
            id="stat-card-servers"
            className={`p-6 rounded-3xl text-center shadow-xl transition-all ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/40' 
                : 'bg-white border border-purple-200 hover:border-purple-400 shadow-purple-900/5'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-3 shadow-lg">
              <Server className="w-7 h-7" />
            </div>
            <div className={`text-3xl sm:text-4xl font-black mb-1 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.activeServers}
            </div>
            <div className={`text-sm font-bold mb-0.5 ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>Active Servers</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Global infrastructure</div>
          </div>

          {/* Services Today */}
          <div 
            id="stat-card-services-today"
            className={`p-6 rounded-3xl text-center shadow-xl transition-all ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/40' 
                : 'bg-white border border-purple-200 hover:border-purple-400 shadow-purple-900/5'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
              <Zap className="w-7 h-7" />
            </div>
            <div className={`text-3xl sm:text-4xl font-black mb-1 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.servicesToday.toLocaleString()}
            </div>
            <div className={`text-sm font-bold mb-0.5 ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>Services Today</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Created today</div>
          </div>

          {/* Total Accounts */}
          <div 
            id="stat-card-total-accounts"
            className={`p-6 rounded-3xl text-center shadow-xl transition-all ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/40' 
                : 'bg-white border border-purple-200 hover:border-purple-400 shadow-purple-900/5'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
              <FileText className="w-7 h-7" />
            </div>
            <div className={`text-3xl sm:text-4xl font-black mb-1 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.totalAccounts.toLocaleString()}
            </div>
            <div className={`text-sm font-bold mb-0.5 ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>Total Accounts</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>All time created</div>
          </div>

          {/* Online Users */}
          <div 
            id="stat-card-online-users"
            className={`p-6 rounded-3xl text-center shadow-xl transition-all ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/40' 
                : 'bg-white border border-purple-200 hover:border-purple-400 shadow-purple-900/5'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-400 mb-3 shadow-lg">
              <Users className="w-7 h-7" />
            </div>
            <div className={`text-3xl sm:text-4xl font-black mb-1 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.onlineUsers.toLocaleString()}
            </div>
            <div className={`text-sm font-bold mb-0.5 ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>Online Users</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active sessions worldwide</div>
          </div>
        </div>

        {/* Today's Service Breakdown Card */}
        <div 
          id="service-breakdown-card"
          className={`p-6 sm:p-8 rounded-3xl transition-all shadow-2xl ${
            isDark 
              ? 'bg-[#151034] border border-purple-500/30' 
              : 'bg-white border border-purple-200 shadow-purple-900/5'
          }`}
        >
          <h3 className={`text-lg sm:text-xl font-bold text-center mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Today's Service Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* SSH */}
            <div className={`p-4 rounded-2xl text-center border ${
              isDark 
                ? 'bg-[#1c1645] border-purple-500/20' 
                : 'bg-purple-50/50 border-purple-100'
            }`}>
              <div className="text-2xl sm:text-3xl font-black text-blue-500 mb-1">
                {stats.breakdown.ssh}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>SSH</div>
            </div>

            {/* OpenVPN */}
            <div className={`p-4 rounded-2xl text-center border ${
              isDark 
                ? 'bg-[#1c1645] border-purple-500/20' 
                : 'bg-purple-50/50 border-purple-100'
            }`}>
              <div className="text-2xl sm:text-3xl font-black text-emerald-500 mb-1">
                {stats.breakdown.openvpn}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>OpenVPN</div>
            </div>

            {/* Trojan VPN */}
            <div className={`p-4 rounded-2xl text-center border ${
              isDark 
                ? 'bg-[#1c1645] border-purple-500/20' 
                : 'bg-purple-50/50 border-purple-100'
            }`}>
              <div className="text-2xl sm:text-3xl font-black text-cyan-500 mb-1">
                {stats.breakdown.trojan}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Trojan VPN</div>
            </div>

            {/* Vmess */}
            <div className={`p-4 rounded-2xl text-center border ${
              isDark 
                ? 'bg-[#1c1645] border-purple-500/20' 
                : 'bg-purple-50/50 border-purple-100'
            }`}>
              <div className="text-2xl sm:text-3xl font-black text-amber-500 mb-1">
                {stats.breakdown.vmess}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Vmess</div>
            </div>

            {/* Vless */}
            <div className={`p-4 rounded-2xl text-center border ${
              isDark 
                ? 'bg-[#1c1645] border-purple-500/20' 
                : 'bg-purple-50/50 border-purple-100'
            }`}>
              <div className="text-2xl sm:text-3xl font-black text-pink-500 mb-1">
                {stats.breakdown.vless}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Vless</div>
            </div>

            {/* WireGuard */}
            <div className={`p-4 rounded-2xl text-center border ${
              isDark 
                ? 'bg-[#1c1645] border-purple-500/20' 
                : 'bg-purple-50/50 border-purple-100'
            }`}>
              <div className="text-2xl sm:text-3xl font-black text-teal-500 mb-1">
                {stats.breakdown.wireguard}
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>WireGuard</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
