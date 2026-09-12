import React from 'react';
import { Shield, Zap, Lock, Globe, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PickTunnelingProps {
  isDark: boolean;
}

export const PickTunneling: React.FC<PickTunnelingProps> = ({ isDark }) => {
  const navigate = useNavigate();

  return (
    <section id="pick-tunneling" className="py-12 md:py-16 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 ${
            isDark 
              ? 'bg-purple-950/70 border border-purple-500/30 text-purple-300 shadow-inner' 
              : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm'
          }`}>
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>Choose Your Protocol</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Pick Your Tunneling
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <strong className={isDark ? 'text-purple-300 font-semibold' : 'text-purple-700 font-semibold'}>
              PremDigital TUNNEL
            </strong> - Free the best tunneling account for you. Wherever you are, protocols tailored for speed, privacy, and bypassing restrictions.
          </p>
        </div>

        {/* 4 Overview Cards */}
        <div className="space-y-4">
          {/* Card 1: VPN Tunnel */}
          <div 
            id="protocol-card-vpn"
            onClick={() => navigate('/free')}
            className={`p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/50 hover:bg-[#1f194c]' 
                : 'bg-white border border-purple-200 shadow-purple-900/5 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    VPN Tunnel
                  </h3>
                  <span className="text-xs text-purple-400 flex items-center gap-1 font-semibold">
                    <span>Explore VPN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className={`text-sm mb-2 leading-relaxed transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Vmess, Vless, Trojan VPN with the best performance and guaranteed privacy for you.
                </p>
                <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md border ${
                  isDark 
                    ? 'text-purple-300/90 bg-purple-950/60 border-purple-500/20' 
                    : 'text-purple-700 bg-purple-50 border-purple-200'
                }`}>
                  Low latency, encrypted for gaming and streaming.
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: SSH Tunnel */}
          <div 
            id="protocol-card-ssh"
            onClick={() => navigate('/ssh-tunnel')}
            className={`p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/50 hover:bg-[#1f194c]' 
                : 'bg-white border border-purple-200 shadow-purple-900/5 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    SSH Tunnel
                  </h3>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <span>Pilih Server SSH</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className={`text-sm mb-2 leading-relaxed transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  All in one service for you, SSH websocket, SSH UDP custom, UDP ZIVPN, SSH Stunnel, SSH Dropbear, OpenSSH just 1 account to get all ssh tunnel services
                </p>
                <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md border ${
                  isDark 
                    ? 'text-emerald-300/90 bg-emerald-950/50 border-emerald-500/20' 
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  Bypass captive portals with Cloudflare-friendly tunnels.
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Global Tunnel */}
          <div 
            id="protocol-card-global"
            onClick={() => navigate('/server-status')}
            className={`p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/50 hover:bg-[#1f194c]' 
                : 'bg-white border border-purple-200 shadow-purple-900/5 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Global Tunnel
                  </h3>
                  <span className="text-xs text-purple-400 flex items-center gap-1 font-semibold">
                    <span>Server Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className={`text-sm mb-2 leading-relaxed transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Our VPS tunnel servers from all countries make it easy for you to choose the most stable server according to where you come from.
                </p>
                <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md border ${
                  isDark 
                    ? 'text-indigo-300/90 bg-indigo-950/50 border-indigo-500/20' 
                    : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                }`}>
                  Bare metal VPS with unlimited dedicated bandwidth
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Config Tunnel */}
          <div 
            id="protocol-card-config"
            onClick={() => navigate('/free')}
            className={`p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              isDark 
                ? 'bg-[#171239] border border-purple-500/20 hover:border-purple-400/50 hover:bg-[#1f194c]' 
                : 'bg-white border border-purple-200 shadow-purple-900/5 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-400 shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-lg sm:text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Config Tunnel
                  </h3>
                  <span className="text-xs text-pink-400 flex items-center gap-1 font-semibold">
                    <span>Instant Config</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className={`text-sm mb-2 leading-relaxed transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  No need to use complicated configurations, our system automatically creates a configuration for your tunneling.
                </p>
                <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md border ${
                  isDark 
                    ? 'text-pink-300/90 bg-pink-950/50 border-pink-500/20' 
                    : 'text-pink-700 bg-pink-50 border-pink-200'
                }`}>
                  Import-ready profiles for Windows, Android, iOS, macOS, Openwrt, Linux
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
