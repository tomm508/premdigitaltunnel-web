import fs from 'fs';

const code = `import React from 'react';
import { Logo } from './Logo';
import { Mail, MessageCircle, Server, Activity, Shield, Phone, HeadphonesIcon } from 'lucide-react';

interface FooterProps {
  isDark: boolean;
  onScrollToTop?: () => void;
  onOpenTool: (toolId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ isDark, onOpenTool }) => {
  return (
    <footer className={\`border-t transition-colors relative \${
      isDark ? 'border-purple-900/30 bg-[#0c0820] text-slate-300' : 'border-purple-100 bg-white text-slate-600'
    }\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center">
              <Logo isDark={isDark} size={36} />
            </div>
            <p className={\`text-sm leading-relaxed \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
              Layanan VPN & SSH Premium terpercaya dengan infrastruktur cloud berkinerja tinggi. Kami mengutamakan kecepatan, privasi, dan kestabilan koneksi untuk kebutuhan digital Anda.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Telegram Support" className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all \${isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white' : 'bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white'}\`}>
                <MessageCircle className="w-5 h-5" />
              </a>
              {/* Future social links can be placed here */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={\`text-sm font-bold tracking-wider uppercase mb-6 \${isDark ? 'text-white' : 'text-slate-900'}\`}>
              Fitur & Layanan
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <button onClick={() => onOpenTool('server-status')} className={\`hover:text-purple-500 transition-colors flex items-center gap-3 \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                  <Server className="w-4 h-4 text-purple-500" /> <span>Status Server</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenTool('ai-chat')} className={\`hover:text-purple-500 transition-colors flex items-center gap-3 \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                  <Activity className="w-4 h-4 text-purple-500" /> <span>AI Diagnostics Tool</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenTool('dns-check')} className={\`hover:text-purple-500 transition-colors flex items-center gap-3 \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                  <Shield className="w-4 h-4 text-purple-500" /> <span>DNS Checker</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className={\`text-sm font-bold tracking-wider uppercase mb-6 \${isDark ? 'text-white' : 'text-slate-900'}\`}>
              Informasi Tambahan
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <button onClick={() => onOpenTool('ai-chat')} className={\`hover:text-purple-500 transition-colors \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                  FAQ & Bantuan Tanya Jawab
                </button>
              </li>
              <li>
                <button onClick={() => {}} className={\`hover:text-purple-500 transition-colors \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                  Syarat & Ketentuan Layanan
                </button>
              </li>
              <li>
                <button onClick={() => {}} className={\`hover:text-purple-500 transition-colors \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                  Kebijakan Privasi
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={\`text-sm font-bold tracking-wider uppercase mb-6 \${isDark ? 'text-white' : 'text-slate-900'}\`}>
              Hubungi Kami
            </h3>
            <div className="space-y-5 text-sm">
              <a href="mailto:premdigitalssh@gmail.com" className={\`flex items-start gap-3 hover:text-purple-500 transition-colors group \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                <div className={\`p-2 rounded-lg \${isDark ? 'bg-purple-900/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'} transition-colors\`}>
                  <Mail className="w-4 h-4" />
                </div>
                <span className="break-all mt-1.5">premdigitalssh@gmail.com</span>
              </a>
              <div className={\`flex items-start gap-3 \${isDark ? 'text-slate-400' : 'text-slate-500'}\`}>
                <div className={\`p-2 rounded-lg \${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}\`}>
                  <HeadphonesIcon className="w-4 h-4" />
                </div>
                <span className="mt-1.5 leading-relaxed">Technical Support &<br />Customer Service</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className={\`mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm \${
          isDark ? 'border-purple-900/50 text-slate-500' : 'border-purple-100 text-slate-400'
        }\`}>
          <p>© {new Date().getFullYear()} premdigital.web.id. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Ditenagai oleh</span>
            <span className={\`font-bold \${isDark ? 'text-purple-400' : 'text-purple-600'}\`}>PremDigital TUNNEL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
`;

fs.writeFileSync('src/components/Footer.tsx', code);
console.log('Footer patched with professional layout');
