import React, { useState } from 'react';
import { 
  Shield, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronDown, 
  LogIn, 
  Zap, 
  Lock, 
  Activity, 
  Globe, 
  Radio, 
  Cpu, 
  Bot, 
  Search, 
  Server,
  Share2,
  Key
} from 'lucide-react';
import { ProtocolType } from '../types';
import { Logo } from './Logo';
import { User } from 'firebase/auth';
import { Wallet } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onSelectProtocol: (protocol: ProtocolType) => void;
  onOpenTool: (toolId: string) => void;
  onOpenAuth: () => void;
  onOpenTopup?: () => void;
  onScrollToSection: (sectionId: string) => void;
  currentUser?: User | null;
  userBalance?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  toggleTheme,
  onSelectProtocol,
  onOpenTool,
  onOpenAuth,
  onOpenTopup,
  onScrollToSection,
  currentUser,
  userBalance = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const servicesList: { id: ProtocolType; label: string; icon: React.ReactNode }[] = [
    { id: 'ssh', label: 'SSH Tunnel', icon: <Share2 className="w-4 h-4 text-blue-400" /> },
    { id: 'vmess', label: 'V2Ray Vmess', icon: <Zap className="w-4 h-4 text-emerald-400" /> },
    { id: 'vless', label: 'Xray Vless', icon: <Shield className="w-4 h-4 text-purple-400" /> },
    { id: 'trojan', label: 'Trojan VPN', icon: <Lock className="w-4 h-4 text-red-400" /> },
    { id: 'openvpn', label: 'OpenVPN', icon: <Key className="w-4 h-4 text-cyan-400" /> },
    { id: 'wireguard', label: 'Wireguard', icon: <Activity className="w-4 h-4 text-teal-400" /> },
  ];

  const toolsList = [
    { id: 'my-ip', label: 'My Ip Location', icon: <Globe className="w-4 h-4 text-indigo-400" /> },
    { id: 'dns-check', label: 'DNS Checkers', icon: <Radio className="w-4 h-4 text-cyan-400" /> },
    { id: 'free-domain', label: 'Free Domain (SNI)', icon: <Search className="w-4 h-4 text-emerald-400" /> },
    { id: 'ping-test', label: 'Ping Test', icon: <Activity className="w-4 h-4 text-amber-400" /> },
    { id: 'host-to-ip', label: 'Host to IP', icon: <Server className="w-4 h-4 text-blue-400" /> },
    { id: 'subdomain-finder', label: 'Subdomain Finder', icon: <Search className="w-4 h-4 text-purple-400" /> },
    { id: 'server-status', label: 'Server Status', icon: <Cpu className="w-4 h-4 text-rose-400" /> },
    { id: 'ai-chat', label: 'Chat With AI', icon: <Bot className="w-4 h-4 text-yellow-400" /> },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b backdrop-blur-md ${
      isDark 
        ? 'bg-[#0f0c22]/90 border-purple-900/30 text-white' 
        : 'bg-white/95 border-purple-200/80 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => onScrollToSection('hero')} 
            className="cursor-pointer group hover:opacity-95 transition-opacity"
          >
            <Logo isDark={isDark} size={40} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button 
              id="nav-home-btn"
              onClick={() => onScrollToSection('hero')} 
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark 
                  ? 'text-slate-200 hover:text-white hover:bg-white/10' 
                  : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              Home
            </button>

            {/* Services Dropdown */}
            <div className="relative group">
              <button 
                id="nav-services-dropdown"
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark 
                    ? 'text-slate-200 hover:text-white hover:bg-white/10' 
                    : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform group-hover:rotate-180 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                }`} />
              </button>
              <div className={`absolute left-0 mt-1 w-56 p-2 rounded-xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                isDark 
                  ? 'bg-[#171338] border-purple-500/20' 
                  : 'bg-white border-purple-200 shadow-purple-900/10'
              }`}>
                {servicesList.map((service) => (
                  <button
                    key={service.id}
                    id={`nav-service-${service.id}`}
                    onClick={() => {
                      onSelectProtocol(service.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                      isDark 
                        ? 'text-slate-300 hover:text-white hover:bg-purple-600/30' 
                        : 'text-slate-700 hover:text-purple-900 hover:bg-purple-50'
                    }`}
                  >
                    {service.icon}
                    <span>{service.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Dropdown */}
            <div className="relative group">
              <button 
                id="nav-tools-dropdown"
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark 
                    ? 'text-slate-200 hover:text-white hover:bg-white/10' 
                    : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                Tools
                <ChevronDown className={`w-4 h-4 transition-transform group-hover:rotate-180 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                }`} />
              </button>
              <div className={`absolute left-0 mt-1 w-56 p-2 rounded-xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                isDark 
                  ? 'bg-[#171338] border-purple-500/20' 
                  : 'bg-white border-purple-200 shadow-purple-900/10'
              }`}>
                {toolsList.map((tool) => (
                  <button
                    key={tool.id}
                    id={`nav-tool-${tool.id}`}
                    onClick={() => onOpenTool(tool.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                      isDark 
                        ? 'text-slate-300 hover:text-white hover:bg-purple-600/30' 
                        : 'text-slate-700 hover:text-purple-900 hover:bg-purple-50'
                    }`}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Right Action Icons (Theme toggle + Login + Mobile toggle) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2.5 rounded-xl border transition-all ${
                isDark 
                  ? 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10' 
                  : 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 shadow-sm'
              }`}
            >
              {isDark ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {/* Auth / Balance Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="header-balance-chip"
                  onClick={onOpenTopup}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                  title="Klik untuk top up saldo"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rp {userBalance.toLocaleString()}</span>
                </button>

                <button
                  id="header-user-profile-btn"
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px] uppercase">
                    {currentUser.displayName ? currentUser.displayName[0] : currentUser.email ? currentUser.email[0] : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Member</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl border transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10' 
                  : 'text-slate-700 hover:text-slate-900 bg-purple-50 hover:bg-purple-100 border-purple-200'
              }`}
              aria-label="Open mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className={`md:hidden border-t px-4 pt-3 pb-6 space-y-3 ${
          isDark ? 'bg-[#120e2d] border-purple-900/40' : 'bg-white border-purple-200 shadow-lg'
        }`}>
          <div className={`rounded-2xl p-2 border space-y-1 ${
            isDark ? 'bg-[#1a143f] border-purple-500/20' : 'bg-purple-50/70 border-purple-200'
          }`}>
            <button
              id="mobile-nav-home"
              onClick={() => {
                onScrollToSection('hero');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-left transition-colors ${
                isDark ? 'text-white hover:bg-purple-600/20' : 'text-slate-900 hover:bg-purple-100'
              }`}
            >
              Home
            </button>

            {/* Services Accordion */}
            <div className={`border-t ${isDark ? 'border-purple-500/10' : 'border-purple-200'}`}>
              <button
                id="mobile-services-accordion"
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isDark ? 'text-slate-200 hover:bg-purple-600/20' : 'text-slate-800 hover:bg-purple-100'
                }`}
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                } ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className={`pl-4 pr-2 pb-2 space-y-1 rounded-xl my-1 ${
                  isDark ? 'bg-[#151034]/60' : 'bg-white/90 border border-purple-100'
                }`}>
                  {servicesList.map((service) => (
                    <button
                      key={service.id}
                      id={`mobile-service-${service.id}`}
                      onClick={() => {
                        onSelectProtocol(service.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                        isDark 
                          ? 'text-slate-300 hover:text-white hover:bg-purple-600/30' 
                          : 'text-slate-700 hover:text-purple-900 hover:bg-purple-50'
                      }`}
                    >
                      {service.icon}
                      <span>{service.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tools Accordion */}
            <div className={`border-t ${isDark ? 'border-purple-500/10' : 'border-purple-200'}`}>
              <button
                id="mobile-tools-accordion"
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isDark ? 'text-slate-200 hover:bg-purple-600/20' : 'text-slate-800 hover:bg-purple-100'
                }`}
              >
                <span>Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                } ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div className={`pl-4 pr-2 pb-2 space-y-1 rounded-xl my-1 ${
                  isDark ? 'bg-[#151034]/60' : 'bg-white/90 border border-purple-100'
                }`}>
                  {toolsList.map((tool) => (
                    <button
                      key={tool.id}
                      id={`mobile-tool-${tool.id}`}
                      onClick={() => {
                        onOpenTool(tool.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left ${
                        isDark 
                          ? 'text-slate-300 hover:text-white hover:bg-purple-600/30' 
                          : 'text-slate-700 hover:text-purple-900 hover:bg-purple-50'
                      }`}
                    >
                      {tool.icon}
                      <span>{tool.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Login Button */}
            <div className="pt-2">
              <button
                id="mobile-login-btn"
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 text-center"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
