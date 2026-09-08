import React, { useState } from 'react';
import { BookOpen, Cpu, Shield, Globe, ChevronDown, ChevronUp, Tag } from 'lucide-react';

interface SpeedGuideProps {
  isDark: boolean;
}

export const SpeedGuide: React.FC<SpeedGuideProps> = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState<'vpn' | 'ssh' | 'v2ray' | 'trojan'>('vpn');

  const keywords = [
    'free openvpn', 'free wireguard', 'openvpn tcp 443', 'udp vpn speed', 
    'wireguard mobile battery', 'mtu settings', 'low latency vpn', 
    'router vpn', 'config download', 'privacy dns', 'openvpn cipher suites', 
    'wireguard roaming', 'vpn performance comparison', 'mobile vpn optimization', 
    'gaming vpn setup', 'streaming vpn configuration'
  ];

  return (
    <section id="speed-guide" className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Container */}
        <div className={`p-6 sm:p-8 rounded-3xl transition-all shadow-2xl ${
          isDark 
            ? 'bg-[#151034] border border-purple-500/20' 
            : 'bg-white border border-purple-200 shadow-purple-900/5'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2.5 rounded-xl border ${
              isDark 
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' 
                : 'bg-purple-100 text-purple-700 border-purple-200'
            }`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Speed, Stability, and Setup
              </h2>
              <p className={`text-xs sm:text-sm ${
                isDark ? 'text-purple-300/80' : 'text-purple-700'
              }`}>
                In-depth technical architecture and tunneling protocol comparison
              </p>
            </div>
          </div>

          {/* Guide Tabs */}
          <div className={`flex flex-wrap gap-2 mb-6 border-b pb-3 ${
            isDark ? 'border-purple-500/20' : 'border-purple-100'
          }`}>
            {[
              { id: 'vpn', label: 'OpenVPN & WireGuard' },
              { id: 'ssh', label: 'SSH & WebSocket' },
              { id: 'v2ray', label: 'V2Ray & Xray' },
              { id: 'trojan', label: 'Trojan Protocol' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`guide-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : isDark
                      ? 'bg-[#1e1747] text-slate-300 hover:text-white hover:bg-[#251d59]'
                      : 'bg-purple-50 text-slate-700 hover:text-purple-900 hover:bg-purple-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className={`space-y-4 text-xs sm:text-sm leading-relaxed transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {activeTab === 'vpn' && (
              <div className="space-y-4">
                <p>
                  <strong className={isDark ? 'text-purple-300' : 'text-purple-700 font-semibold'}>OpenVPN and WireGuard</strong> are the two most popular standards for encrypted tunneling today, and PremDigital TUNNEL offers both as <strong className="text-emerald-500 font-semibold">FREE VPN</strong> options with ready-to-import profiles. <strong className={isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'}>OpenVPN</strong> wins on compatibility: there are clients for Windows, Android, iOS, macOS, Linux, routers, and NAS boxes. When a network is fussy or runs through proxies, <strong className={isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'}>OpenVPN TCP 443</strong> looks like regular HTTPS and usually gets through.
                </p>
                <p>
                  When the line is clean and you want throughput, <strong className={isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'}>OpenVPN UDP</strong> generally performs better than TCP. <strong className={isDark ? 'text-purple-300 font-semibold' : 'text-purple-700 font-semibold'}>WireGuard</strong>, meanwhile, is built around modern cryptography and a lean codebase. Handshakes are fast, roaming between Wi-Fi and cellular is snappy, CPU overhead is low, and battery drain on mobile is typically less than legacy protocols. Many users report that WireGuard feels "instant" when launching games or streaming 4K content.
                </p>
                <p>
                  For the best experience, choose a region close to you. Latency drops dramatically when the exit node is geographically nearby. If a route degrades during peak hours, try a neighboring country or city; internet paths are dynamic and capacity shifts constantly.
                </p>
              </div>
            )}

            {activeTab === 'ssh' && (
              <div className="space-y-4">
                <h4 className={`text-base font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <span>Free SSH Tunneling — WebSocket, SSL/Stunnel, UDP Custom</span>
                </h4>
                <p>
                  SSH tunneling allows you to forward encrypted packets through standard SSH daemons. By pairing <strong className={isDark ? 'text-purple-300' : 'text-purple-700 font-semibold'}>SSH with WebSocket and Cloudflare CDN</strong>, your outbound packets are wrapped in valid HTTP/1.1 or HTTP/2 WebSocket upgrade requests, disguising your traffic as standard cloud web traffic.
                </p>
                <p>
                  With <strong className="text-emerald-500 font-semibold">SSH UDP Custom</strong>, gamers experience ultra-responsive round-trip times without the heavy TCP handshaking penalties. This makes SSH tunneling the ultimate swiss-army knife for escaping ISP throttling and accessing restricted educational or gaming portals.
                </p>
              </div>
            )}

            {activeTab === 'v2ray' && (
              <div className="space-y-4">
                <h4 className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  V2Ray VMess & Xray VLESS Architecture
                </h4>
                <p>
                  <strong className={isDark ? 'text-purple-300' : 'text-purple-700 font-semibold'}>V2Ray's architecture</strong> is designed for maximum flexibility and stealth. The platform supports multiple transport protocols including TCP, mKCP, WebSocket, HTTP/2, Domain Socket, and QUIC. Each transport can be configured with different obfuscation methods to bypass deep packet inspection (DPI) and network restrictions.
                </p>
                <p>
                  <strong className={isDark ? 'text-white font-medium' : 'text-slate-900 font-medium'}>VMess protocol</strong> uses dynamic port hopping and custom packet authentication to make traffic patterns harder to detect, while <strong className={isDark ? 'text-pink-300 font-medium' : 'text-pink-600 font-medium'}>VLESS protocol</strong> is even more lightweight with reduced overhead, enabling near-line-speed connections.
                </p>
              </div>
            )}

            {activeTab === 'trojan' && (
              <div className="space-y-4">
                <h4 className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Trojan VPN — Native HTTPS Camouflage
                </h4>
                <p>
                  <strong className="text-red-500 font-semibold">Trojan VPN</strong> operates on standard Port 443 with TLS 1.3 encryption. Unlike legacy VPN protocols that have recognizable packet headers, Trojan imitates standard TLS web traffic with 100% cryptographic accuracy. 
                </p>
                <p>
                  When inspected by firewall censors, Trojan presents a legitimate TLS certificate and responds just like an authentic web server hosting an HTTPS website. This renders it completely immune to heuristic blocking.
                </p>
              </div>
            )}
          </div>

          {/* Keywords Cloud */}
          <div className={`mt-8 pt-6 border-t ${
            isDark ? 'border-purple-500/20' : 'border-purple-100'
          }`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-purple-300' : 'text-purple-700'
            }`}>
              <Tag className="w-3.5 h-3.5" />
              <span>Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    isDark 
                      ? 'bg-[#1a1442] text-slate-300 border-purple-500/20 hover:border-purple-400/40 hover:text-white' 
                      : 'bg-purple-50 text-slate-700 border-purple-200 hover:border-purple-400 hover:text-purple-900'
                  }`}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
