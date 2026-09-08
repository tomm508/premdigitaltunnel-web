import React from 'react';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface CtaBannerProps {
  isDark?: boolean;
  onStartFree: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ isDark = true, onStartFree }) => {
  return (
    <section id="cta-banner" className="py-10 md:py-16 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center transition-all shadow-2xl ${
            isDark
              ? 'bg-gradient-to-b from-[#21174d] via-[#1a1242] to-[#140e34] border border-purple-500/30'
              : 'bg-gradient-to-b from-purple-50 via-indigo-50/70 to-white border border-purple-200 shadow-purple-900/10'
          }`}
        >
          {/* Subtle soft lighting radial gradient (GPU safe, zero filter blur) */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: isDark
                ? 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.25) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 70%)'
            }}
          />

          {/* Badge */}
          <div className={`relative inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-6 ${
            isDark 
              ? 'bg-purple-900/60 border border-purple-400/30 text-purple-200 shadow-inner' 
              : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Ready to Get Started?</span>
          </div>

          {/* Title */}
          <h2 className={`relative text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Start Free Tunneling
          </h2>

          {/* Subtitle */}
          <p className={`relative text-sm sm:text-base max-w-md mx-auto mb-8 transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Generate SSH or VPN credentials now and connect in seconds.
          </p>

          {/* CTA Button */}
          <div className="relative mb-8">
            <button
              id="cta-get-started-free-btn"
              onClick={onStartFree}
              className="px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Get Started Free</span>
            </button>
          </div>

          {/* 3 Trust Badges */}
          <div className={`relative flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant Setup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
