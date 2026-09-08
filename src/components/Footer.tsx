import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
  isDark: boolean;
  onScrollToTop?: () => void;
  onOpenTool: (toolId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ isDark, onOpenTool }) => {
  return (
    <footer className={`border-t transition-colors py-10 relative ${
      isDark ? 'border-purple-900/30 bg-[#0c0820] text-slate-300' : 'border-purple-200 bg-white text-slate-600'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-center">
          <Logo isDark={isDark} size={36} />
        </div>

        {/* Links */}
        <div className={`flex flex-wrap justify-center gap-4 sm:gap-6 text-xs font-semibold ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <button onClick={() => onOpenTool('ai-chat')} className="hover:text-purple-600 transition-colors">
            About Us
          </button>
          <button onClick={() => onOpenTool('ai-chat')} className="hover:text-purple-600 transition-colors">
            Contact
          </button>
          <button onClick={() => onOpenTool('dns-check')} className="hover:text-purple-600 transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => onOpenTool('dns-check')} className="hover:text-purple-600 transition-colors">
            Terms of Service
          </button>
          <button onClick={() => onOpenTool('server-status')} className="hover:text-purple-600 transition-colors">
            Server Status
          </button>
        </div>

        {/* Copyright */}
        <div className={`pt-4 border-t text-xs ${
          isDark ? 'border-purple-500/10 text-slate-400' : 'border-purple-100 text-slate-500'
        }`}>
          <p>© 2026 premdigital.web.id. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
