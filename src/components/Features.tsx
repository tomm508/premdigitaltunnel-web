import React from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Cpu, 
  Smartphone, 
  Headphones, 
  Zap, 
  Sparkles,
  Globe2
} from 'lucide-react';

interface FeaturesProps {
  isDark: boolean;
}

export const Features: React.FC<FeaturesProps> = ({ isDark }) => {
  const featuresList = [
    {
      id: 'free-premium',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: 'Free + Premium',
      description: 'Free accounts stay fast thanks to automatic cleanup. Upgrade to VVIP for guaranteed slots and dedicated bandwidth.',
      color: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'dpi-firewall',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      title: 'DPI & Firewall Ready',
      description: 'SSH Tunnel, OpenVPN, WireGuard, Trojan VPN, Vmess, Vless, WebSocket, SSL, and gRPC options help you slip through corporate firewalls and ISP throttling.',
      color: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'modern-website',
      icon: <Cpu className="w-5 h-5 text-blue-500" />,
      title: 'Modern Website',
      description: 'Simple UI — easy to create a tunneling account with our intuitive and user-friendly interface.',
      color: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'global-servers',
      icon: <Globe2 className="w-5 h-5 text-emerald-500" />,
      title: 'Global Servers',
      description: 'Access worldwide content from many regions with low latency bare-metal routing.',
      color: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'multi-platform',
      icon: <Smartphone className="w-5 h-5 text-pink-500" />,
      title: 'Multi-Platform',
      description: 'Windows, Android, iOS, macOS, Linux — all supported with 1-click importable configuration files.',
      color: 'bg-pink-500/10 border-pink-500/20'
    },
    {
      id: 'helpful-support',
      icon: <Headphones className="w-5 h-5 text-cyan-500" />,
      title: 'Helpful Support',
      description: 'Responsive support ready to help you with configs, payloads, and protocol troubleshooting.',
      color: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      id: 'uptime-99',
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      title: 'Uptime 99%',
      description: 'VPS server uptime 99% connection is more comfortable with automatic failover.',
      color: 'bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <section id="features" className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 ${
            isDark 
              ? 'bg-purple-950/70 border border-purple-500/30 text-purple-300 shadow-inner' 
              : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Why Choose Us</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Premium Features
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Experience lightning fast internet freedom backed by reliable cloud infrastructure.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuresList.map((item) => (
            <div
              key={item.id}
              id={`feature-card-${item.id}`}
              className={`p-5 rounded-2xl transition-all flex flex-col justify-between shadow-lg group ${
                isDark 
                  ? 'bg-[#171239]/90 border border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1f194c]' 
                  : 'bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/30 shadow-purple-900/5'
              }`}
            >
              <div className="flex items-start gap-4 mb-2">
                <div className={`w-10 h-10 rounded-xl ${item.color} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className={`font-bold text-base mb-1 transition-colors ${
                    isDark ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-700'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
