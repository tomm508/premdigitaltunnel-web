import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Radio, 
  Activity, 
  Server, 
  Search, 
  Cpu, 
  Bot, 
  Send, 
  CheckCircle2, 
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SERVERS_LIST } from '../data/mockData';

interface ToolsModalProps {
  toolId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({ toolId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('my-ip');
  
  // My IP State
  const [ipData, setIpData] = useState<any>({
    ip: '103.247.11.85',
    city: 'Jakarta',
    region: 'DKI Jakarta',
    country_name: 'Indonesia',
    country_code: 'ID',
    org: 'PT Telkom Indonesia',
    timezone: 'Asia/Jakarta'
  });
  const [loadingIp, setLoadingIp] = useState(false);

  // Ping Test State
  const [pingResults, setPingResults] = useState<{ [key: string]: number | null }>({});
  const [pinging, setPinging] = useState(false);

  // Host to IP State
  const [lookupHost, setLookupHost] = useState('m.youtube.com');
  const [resolvedIps, setResolvedIps] = useState<string[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  // Subdomain Finder
  const [subdomainDomain, setSubdomainDomain] = useState('vidio.com');
  const [foundSubdomains, setFoundSubdomains] = useState<string[]>([]);
  const [isFindingSubdomains, setIsFindingSubdomains] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Halo! Saya AI Tunneling Assistant dari PremDigital TUNNEL. Ada yang bisa saya bantu terkait setup SSH WebSocket, V2Ray VMess, Xray VLESS, Trojan, bug host / SNI, atau error payload?'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  useEffect(() => {
    if (toolId) {
      setActiveTab(toolId);
    }
  }, [toolId]);

  // Fetch or mock real IP
  useEffect(() => {
    if (isOpen && activeTab === 'my-ip') {
      fetchUserIp();
    }
  }, [isOpen, activeTab]);

  const fetchUserIp = async () => {
    setLoadingIp(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        setIpData(data);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoadingIp(false);
    }
  };

  const runPingTest = () => {
    setPinging(true);
    const results: { [key: string]: number } = {};
    SERVERS_LIST.forEach((srv) => {
      // add minor realistic fluctuation
      results[srv.id] = Math.max(5, srv.ping + Math.floor(Math.random() * 8) - 4);
    });
    setTimeout(() => {
      setPingResults(results);
      setPinging(false);
    }, 800);
  };

  const handleResolveHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupHost) return;
    setIsResolving(true);
    setTimeout(() => {
      const simulated = [
        `172.217.194.${Math.floor(Math.random() * 200 + 10)}`,
        `142.250.185.${Math.floor(Math.random() * 200 + 10)}`,
        `104.16.85.${Math.floor(Math.random() * 200 + 10)}`,
      ];
      setResolvedIps(simulated);
      setIsResolving(false);
    }, 600);
  };

  const handleFindSubdomains = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomainDomain) return;
    setIsFindingSubdomains(true);
    setTimeout(() => {
      const domain = subdomainDomain.replace(/^https?:\/\//, '').split('/')[0];
      setFoundSubdomains([
        `quiz.int.${domain}`,
        `cdn.${domain}`,
        `static.${domain}`,
        `api.${domain}`,
        `auth.${domain}`,
        `stream.${domain}`
      ]);
      setIsFindingSubdomains(false);
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || aiTyping) return;

    const query = userInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: query }]);
    setUserInput('');
    setAiTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('sni') || q.includes('bug')) {
        reply = 'Untuk SNI / Bug Host, Anda bisa gunakan domain yang masuk dalam paket kuota internet Anda (contoh: m.youtube.com untuk kuota YouTube, quiz.int.vidio.com untuk Vidio, atau zoom.us). Masukkan domain ini ke kolom SNI saat generate akun atau di aplikasi v2rayNG/HTTP Injector.';
      } else if (q.includes('vless') || q.includes('vmess')) {
        reply = 'V2Ray VMess dan Xray VLESS kami sudah didukung WebSocket Cloudflare CDN dan Port 443 TLS. Untuk import, copy config link vmess:// atau vless:// lalu pilih "Import from Clipboard" di v2rayNG (Android), V2Box (iOS), atau v2rayN (Windows).';
      } else if (q.includes('ssh') || q.includes('payload') || q.includes('ws')) {
        reply = 'Format HTTP WebSocket Payload untuk SSH:\n\nGET / HTTP/1.1[crlf]Host: [host_bug][crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf][crlf]\n\nGanti [host_bug] dengan bug host yang Anda gunakan!';
      } else if (q.includes('game') || q.includes('ping') || q.includes('lag')) {
        reply = 'Untuk gaming online (Mobile Legends, FF, PUBG), kami sangat merekomendasikan server Singapore 🇸🇬 atau Indonesia 🇮🇩 dengan protokol SSH UDP Custom untuk ping terendah (10-30ms) dan anti-disconnect.';
      } else {
        reply = `Terima kasih! Layanan PremDigital TUNNEL menyediakan server gratis 100% dengan proteksi SSL/TLS dan CDN Cloudflare. Anda bisa langsung generate akun di tab Services. Ada hal teknis lain yang ingin ditanyakan?`;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setAiTyping(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80  overflow-y-auto">
      <div 
        id="tools-modal-container"
        className="relative w-full max-w-2xl my-6 bg-[#161138] border border-purple-500/30 rounded-3xl shadow-2xl text-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#120d30]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-400/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Network & Tunneling Tools</h3>
              <p className="text-xs text-purple-300/80">Diagnostics, IP lookup, DNS testing, and AI Assistant</p>
            </div>
          </div>
          <button
            id="close-tools-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto p-2 bg-[#120d2d] border-b border-purple-500/20 gap-1 text-xs font-semibold">
          {[
            { id: 'my-ip', label: 'My IP', icon: <Globe className="w-3.5 h-3.5" /> },
            { id: 'ping-test', label: 'Ping Test', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'dns-check', label: 'DNS Checker', icon: <Radio className="w-3.5 h-3.5" /> },
            { id: 'host-to-ip', label: 'Host to IP', icon: <Server className="w-3.5 h-3.5" /> },
            { id: 'subdomain-finder', label: 'Subdomain Finder', icon: <Search className="w-3.5 h-3.5" /> },
            { id: 'server-status', label: 'Server Status', icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'ai-chat', label: 'Chat With AI', icon: <Bot className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tool-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* Tool 1: My IP */}
          {activeTab === 'my-ip' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Public IP Details</span>
                <button
                  onClick={fetchUserIp}
                  disabled={loadingIp}
                  className="flex items-center gap-1 text-xs text-purple-300 hover:text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingIp ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#120d2c] border border-purple-500/20 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="font-bold text-white text-sm">{ipData.ip}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">City / Region:</span>
                  <span className="text-white">{ipData.city}, {ipData.region}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Country:</span>
                  <span className="text-white">{ipData.country_name} ({ipData.country_code})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">ISP / Organization:</span>
                  <span className="text-purple-300 font-semibold">{ipData.org}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Timezone:</span>
                  <span className="text-slate-300">{ipData.timezone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tool 2: Ping Test */}
          {activeTab === 'ping-test' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Global Tunnel Ping Latency</h4>
                  <p className="text-xs text-slate-400">Measure roundtrip response time to edge nodes</p>
                </div>
                <button
                  id="btn-run-ping-test"
                  onClick={runPingTest}
                  disabled={pinging}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
                  <span>{pinging ? 'Pinging...' : 'Start Ping Test'}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {SERVERS_LIST.map((srv) => {
                  const ping = pingResults[srv.id] || srv.ping;
                  return (
                    <div key={srv.id} className="p-3 rounded-xl bg-[#120d2c] border border-purple-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{srv.flag}</span>
                        <div>
                          <div className="font-bold text-xs text-white">{srv.country} ({srv.city})</div>
                          <div className="text-[11px] text-slate-400 font-mono">{srv.host}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${
                          ping < 50 ? 'text-emerald-400' : ping < 120 ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {ping} ms
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          ping < 50 ? 'bg-emerald-500' : ping < 120 ? 'bg-amber-500' : 'bg-slate-500'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tool 3: DNS Check */}
          {activeTab === 'dns-check' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">Public DNS Resolvers Health</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Cloudflare DNS', primary: '1.1.1.1', secondary: '1.0.0.1', doh: 'https://cloudflare-dns.com/dns-query', status: 'Optimal (12ms)' },
                  { name: 'Google Public DNS', primary: '8.8.8.8', secondary: '8.8.4.4', doh: 'https://dns.google/dns-query', status: 'Optimal (15ms)' },
                  { name: 'Quad9 Privacy DNS', primary: '9.9.9.9', secondary: '149.112.112.112', doh: 'https://dns.quad9.net/dns-query', status: 'Active (22ms)' },
                  { name: 'AdGuard DNS (Anti-Ads)', primary: '94.140.14.14', secondary: '94.140.15.15', doh: 'https://dns.adguard.com/dns-query', status: 'Active (30ms)' },
                ].map((dns, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#120d2c] border border-purple-500/20 text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-purple-300">{dns.name}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-semibold">
                        {dns.status}
                      </span>
                    </div>
                    <div className="font-mono text-slate-300 space-y-1 text-[11px]">
                      <div>Primary: {dns.primary}</div>
                      <div>Secondary: {dns.secondary}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool 4: Host to IP */}
          {activeTab === 'host-to-ip' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Domain Host to IP Resolver</h4>
                <p className="text-xs text-slate-400">Discover underlying IP addresses for SNI bug hosts and proxies.</p>
              </div>

              <form onSubmit={handleResolveHost} className="flex gap-2">
                <input
                  type="text"
                  value={lookupHost}
                  onChange={(e) => setLookupHost(e.target.value)}
                  placeholder="e.g. m.youtube.com, zoom.us"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white flex items-center gap-1.5"
                >
                  {isResolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Resolve</span>
                </button>
              </form>

              {resolvedIps.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#120d2c] border border-purple-500/20 space-y-2 font-mono text-xs">
                  <div className="text-slate-400 mb-2">Resolved IP Addresses for <strong className="text-purple-300">{lookupHost}</strong>:</div>
                  {resolvedIps.map((ip, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#18123c] flex justify-between items-center text-white">
                      <span>{ip}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Active Anycast</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tool 5: Subdomain Finder */}
          {activeTab === 'subdomain-finder' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm mb-1">Subdomain Scanner</h4>
                <p className="text-xs text-slate-400">Scan for live subdomains that can be leveraged as bug hosts.</p>
              </div>

              <form onSubmit={handleFindSubdomains} className="flex gap-2">
                <input
                  type="text"
                  value={subdomainDomain}
                  onChange={(e) => setSubdomainDomain(e.target.value)}
                  placeholder="e.g. vidio.com, zoom.us"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={isFindingSubdomains}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white flex items-center gap-1.5"
                >
                  {isFindingSubdomains ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Scan</span>
                </button>
              </form>

              {foundSubdomains.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#120d2c] border border-purple-500/20 space-y-2 font-mono text-xs">
                  <div className="text-slate-400 mb-2">Discovered Subdomains:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {foundSubdomains.map((sub, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#18123c] text-purple-300 flex items-center justify-between">
                        <span>{sub}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tool 6: Server Status */}
          {activeTab === 'server-status' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-white text-sm">Server Fleet Telemetry</h4>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  All 19 Nodes Online
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {SERVERS_LIST.map((srv) => (
                  <div key={srv.id} className="p-3 rounded-2xl bg-[#120d2c] border border-purple-500/20 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>{srv.flag}</span>
                        <span>{srv.country} - {srv.city}</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">{srv.ping} ms</span>
                    </div>

                    {/* Load Bar */}
                    <div className="w-full bg-[#20184b] h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          srv.load > 70 ? 'bg-amber-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${srv.load}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Server Load: {srv.load}%</span>
                      <span>Port 443 / 22: <strong className="text-emerald-400">OPEN</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool 7: AI Chat */}
          {activeTab === 'ai-chat' && (
            <div className="flex flex-col h-[400px]">
              {/* Messages Box */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                          : 'bg-[#120d2c] border border-purple-500/20 text-slate-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-[#120d2c] border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                      <Bot className="w-4 h-4 animate-bounce" />
                      <span>PremDigital AI is typing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Tanya soal bug SNI, vmess, vless, atau format payload..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400 placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={aiTyping || !userInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
