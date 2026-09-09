import React from 'react';
import { ShieldCheck, Globe2, ShieldAlert, Zap, ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  isDark: boolean;
  onGetStarted: () => void;
  onExploreProtocols: () => void;
}

export const Hero: React.FC<HeroProps> = ({ isDark, onGetStarted, onExploreProtocols }) => {
  return (
    <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background glow effects (GPU safe radial gradients) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.10) 45%, transparent 70%)'
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Status Pill */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-8 backdrop-blur-md transition-colors ${
          isDark 
            ? 'bg-purple-950/60 border border-purple-500/30 text-purple-200 shadow-inner' 
            : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm'
        }`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Keep Alive & Secure, by premdigital.web.id</span>
        </div>

        {/* Headline */}
        <h1 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 transition-colors ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Fast Secure <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500">
            SSH VPN Tunneling
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10 transition-colors ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Create VPN and SSH tunneling accounts in seconds. <strong className={isDark ? 'text-purple-300 font-semibold' : 'text-purple-700 font-semibold'}>SSH Tunnel WebSocket, OpenVPN, V2Ray Vmess, Xray Vless, Trojan VPN, Wireguard</strong> with global servers and zero logs policy.
        </p>

        {/* 4 Feature Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto mb-10">
          {/* Card 1: Secure Encryption */}
          <div 
            id="hero-feature-encryption"
            className={`group p-4 sm:p-5 rounded-2xl transition-all flex flex-col items-center justify-center text-center shadow-lg ${
              isDark 
                ? 'bg-[#18133b]/80 border border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1f194c]/90' 
                : 'bg-white border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50/40 shadow-purple-900/5'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className={`text-xs sm:text-sm font-semibold transition-colors ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              Secure Encryption
            </span>
          </div>

          {/* Card 2: Global Servers */}
          <div 
            id="hero-feature-servers"
            className={`group p-4 sm:p-5 rounded-2xl transition-all flex flex-col items-center justify-center text-center shadow-lg ${
              isDark 
                ? 'bg-[#18133b]/80 border border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1f194c]/90' 
                : 'bg-white border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50/40 shadow-purple-900/5'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <span className={`text-xs sm:text-sm font-semibold transition-colors ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              Global Servers
            </span>
          </div>

          {/* Card 3: Zero Logs */}
          <div 
            id="hero-feature-zerologs"
            className={`group p-4 sm:p-5 rounded-2xl transition-all flex flex-col items-center justify-center text-center shadow-lg ${
              isDark 
                ? 'bg-[#18133b]/80 border border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1f194c]/90' 
                : 'bg-white border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50/40 shadow-purple-900/5'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className={`text-xs sm:text-sm font-semibold transition-colors ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              Zero Logs
            </span>
          </div>

          {/* Card 4: Instant Setup */}
          <div 
            id="hero-feature-instant"
            className={`group p-4 sm:p-5 rounded-2xl transition-all flex flex-col items-center justify-center text-center shadow-lg ${
              isDark 
                ? 'bg-[#18133b]/80 border border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1f194c]/90' 
                : 'bg-white border border-purple-200/80 hover:border-purple-400 hover:bg-purple-50/40 shadow-purple-900/5'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <span className={`text-xs sm:text-sm font-semibold transition-colors ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              Instant Setup
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center">
          <button
            id="hero-get-started-btn"
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
