import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Check, 
  Copy, 
  Download, 
  QrCode, 
  Server, 
  Shield, 
  Clock, 
  Sparkles, 
  Key, 
  Globe, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Terminal,
  Zap,
  Info
} from 'lucide-react';
import { ProtocolType, TunnelServer, GeneratedAccount } from '../types';
import { SERVERS_LIST, PROTOCOL_SERVICES } from '../data/mockData';
import { subscribeVpsNodes, UnifiedServerNode } from '../lib/serverSync';

interface AccountModalProps {
  protocol: ProtocolType;
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (acc: GeneratedAccount) => void;
  initialAccount?: GeneratedAccount | null;
  initialServer?: TunnelServer | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  protocol,
  isOpen,
  onClose,
  onAccountCreated,
  initialAccount,
  initialServer
}) => {
  const [liveServers, setLiveServers] = useState<UnifiedServerNode[]>(() => 
    SERVERS_LIST.map(s => ({ ...s, status: 'Down' as const }))
  );
  const [selectedServer, setSelectedServer] = useState<TunnelServer>(initialServer || SERVERS_LIST[0]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [sni, setSni] = useState('sg1.premdigital.web.id');
  const [expiryDays, setExpiryDays] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAccount, setGeneratedAccount] = useState<GeneratedAccount | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeResultTab, setActiveResultTab] = useState<'info' | 'config' | 'payload' | 'qr'>('info');

  const protocolService = PROTOCOL_SERVICES.find((p) => p.id === protocol) || PROTOCOL_SERVICES[0];

  // Subscribe to live server heartbeats
  useEffect(() => {
    const unsub = subscribeVpsNodes((servers) => {
      setLiveServers(servers);
      // If currently selected server is offline, pick the first online server
      if (!initialServer) {
        const firstOnline = servers.find(s => s.status === 'Online');
        if (firstOnline) {
          setSelectedServer(firstOnline);
        }
      }
    });
    return () => unsub();
  }, [initialServer]);

  // Auto-fill random username
  useEffect(() => {
    if (isOpen) {
      if (initialServer) {
        setSelectedServer(initialServer);
      } else {
        setSelectedServer(SERVERS_LIST[0]);
      }
      
      if (initialAccount) {
        setGeneratedAccount(initialAccount);
        setActiveResultTab('info');
      } else {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        setUsername(`prem_${randNum}`);
        setPassword(Math.random().toString(36).slice(-8));
        setGeneratedAccount(null);
        setQrDataUrl('');
        setActiveResultTab('info');
      }
    }
  }, [isOpen, protocol, initialAccount]);

  // Update SNI default when server changes
  useEffect(() => {
    setSni(selectedServer.host);
  }, [selectedServer]);

  // Generate QR Code when config is available
  useEffect(() => {
    if (generatedAccount?.configString) {
      QRCode.toDataURL(generatedAccount.configString, {
        width: 280,
        margin: 1,
        color: {
          dark: '#0f0c22',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR Code error:', err));
    }
  }, [generatedAccount]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiryDays);
      const expiryStr = expiry.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const uuid = 'c4d7e82a-' + Math.random().toString(36).substring(2, 6) + '-4a73-89b1-' + Math.random().toString(36).substring(2, 14);
      const cleanSni = sni.trim() || selectedServer.host;

      let configString = '';
      let payloadString = '';
      let rawConfig = '';

      if (protocol === 'vmess') {
        const vmessObj = {
          v: '2',
          ps: `PremDigital-${selectedServer.countryCode}-${username}`,
          add: selectedServer.host,
          port: '443',
          id: uuid,
          aid: '0',
          scy: 'auto',
          net: 'ws',
          type: 'none',
          host: cleanSni,
          path: '/vmess',
          tls: 'tls',
          sni: cleanSni,
        };
        configString = 'vmess://' + btoa(JSON.stringify(vmessObj));
      } else if (protocol === 'vless') {
        configString = `vless://${uuid}@${selectedServer.host}:443?path=%2Fvless&security=tls&encryption=none&host=${cleanSni}&type=ws&sni=${cleanSni}#PremDigital-${selectedServer.countryCode}-${username}`;
      } else if (protocol === 'trojan') {
        configString = `trojan://${password}@${selectedServer.host}:443?security=tls&headerType=none&type=ws&sni=${cleanSni}&path=%2Ftrojan#PremDigital-${selectedServer.countryCode}-${username}`;
      } else if (protocol === 'ssh') {
        configString = `ssh://${username}:${password}@${selectedServer.host}:22`;
        payloadString = `GET / HTTP/1.1[crlf]Host: ${cleanSni}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf][crlf]`;
      }

      const account: GeneratedAccount = {
        protocol,
        server: selectedServer,
        username: username.trim(),
        password,
        uuid,
        expiryDate: expiryStr,
        activeDays: expiryDays,
        sni: cleanSni,
        ports: {
          sslTls: 443,
          dropbear: 109,
          openSsh: 22,
          wsCdn: 80,
          udpCustom: '1-65535',
          v2rayPort: 443,
          trojanPort: 443,
        },
        configString,
        payloadString,
        rawConfig,
        createdAt: new Date().toISOString(),
      };

      // Add command to VPS queue for auto-creation
      try {
        addDoc(collection(db, 'vps_commands'), {
          serverId: selectedServer.id,
          action: 'CREATE_ACCOUNT',
          protocol,
          username: username.trim(),
          password,
          uuid,
          activeDays: expiryDays,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      } catch (cmdErr) {
        console.warn("Gagal mengirim command ke VPS:", cmdErr);
      }

      setGeneratedAccount(account);
      onAccountCreated(account);
      setIsGenerating(false);
    }, 750);
  };

  const handleDownloadFile = () => {
    if (!generatedAccount) return;
    let filename = `PremDigital-${generatedAccount.protocol}-${generatedAccount.username}.txt`;
    let content = generatedAccount.configString || '';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80  overflow-y-auto">
      <div 
        id="account-modal-container"
        className="relative w-full max-w-2xl my-6 bg-[#161138] border border-purple-500/30 rounded-3xl shadow-2xl text-white overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#120d30]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {protocolService.name}
              </h3>
              <p className="text-xs text-purple-300/80">
                Generate active account with fast Cloudflare CDN support
              </p>
            </div>
          </div>
          <button
            id="close-account-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {!generatedAccount ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Step 1: Server Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2.5">
                  1. Select Tunnel Server Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 pr-2">
                  {liveServers.map((srv) => {
                    const isSelected = selectedServer.id === srv.id;
                    const isOnline = srv.status === 'Online';
                    return (
                      <div
                        key={srv.id}
                        id={`server-select-${srv.id}`}
                        onClick={() => {
                          if (isOnline) setSelectedServer(srv);
                        }}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          !isOnline
                            ? 'bg-[#120f28]/60 border-rose-900/30 text-slate-500 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-purple-600/20 border-purple-400 text-white shadow-md shadow-purple-600/20 cursor-pointer'
                            : 'bg-[#1b1542] border-purple-900/40 text-slate-300 hover:bg-[#20194e] hover:border-purple-500/30 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{srv.flag}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-white">{srv.country}</span>
                              {isOnline ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  Online
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  Offline
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{srv.city}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isOnline ? `${srv.ping}ms` : 'Timeout'}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {isOnline ? `${srv.usedSlots}/${srv.totalSlots} used` : 'Node Mati'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Account Details */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                  2. Account Credentials
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Username
                    </label>
                    <input
                      id="account-username-input"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. prem_user"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      id="account-password-input"
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm font-medium"
                    />
                  </div>
                </div>

                {/* SNI / Bug Host input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <span>SNI / Bug Host (Optional / Custom)</span>
                    </label>
                    <span className="text-[11px] text-purple-300/80">Default: {selectedServer.host}</span>
                  </div>
                  <input
                    id="account-sni-input"
                    type="text"
                    value={sni}
                    onChange={(e) => setSni(e.target.value)}
                    placeholder="e.g. m.youtube.com, zoom.us, or server domain"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm font-mono"
                  />
                  {/* Quick SNI tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-400 py-0.5">Quick picks:</span>
                    {['m.youtube.com', 'zoom.us', 'quiz.int.vidio.com', 'v.whatsapp.net', selectedServer.host].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSni(item)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/60 hover:bg-purple-800/40 text-purple-300 border border-purple-500/30 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expiry Option */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Account Validity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { days: 3, label: '3 Days Free', desc: 'Standard' },
                      { days: 7, label: '7 Days Free', desc: 'Popular' },
                      { days: 30, label: '30 Days VIP', desc: 'VIP Special' },
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        id={`expiry-btn-${opt.days}`}
                        type="button"
                        onClick={() => setExpiryDays(opt.days)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          expiryDays === opt.days
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                            : 'bg-[#1b1542] border-purple-900/30 text-slate-400 hover:bg-[#20194e]'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] text-purple-300/80">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  id="create-account-submit-btn"
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Provisioning Tunnel Configuration...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-amber-300" />
                      <span>Generate {protocolService.badge} Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Generated Account Result View */
            <div className="space-y-5">
              {/* Success Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-300">Account Created Successfully!</h4>
                    <p className="text-xs text-slate-300">
                      Valid for {generatedAccount.activeDays} days until {generatedAccount.expiryDate}
                    </p>
                  </div>
                </div>
                <button
                  id="btn-create-another-account"
                  onClick={() => setGeneratedAccount(null)}
                  className="text-xs text-purple-300 hover:text-white px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 transition-colors"
                >
                  Create Another
                </button>
              </div>

              {/* Result Tabs */}
              <div className="flex border-b border-purple-500/20 gap-2">
                <button
                  id="tab-account-info"
                  onClick={() => setActiveResultTab('info')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors relative ${
                    activeResultTab === 'info'
                      ? 'text-purple-300 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Account Info
                </button>
                <button
                  id="tab-account-config"
                  onClick={() => setActiveResultTab('config')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors relative ${
                    activeResultTab === 'config'
                      ? 'text-purple-300 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Config URL / Link
                </button>
                {protocol === 'ssh' && (
                  <button
                    id="tab-account-payload"
                    onClick={() => setActiveResultTab('payload')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-colors relative ${
                      activeResultTab === 'payload'
                        ? 'text-purple-300 border-b-2 border-purple-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    HTTP Payload
                  </button>
                )}
                <button
                  id="tab-account-qr"
                  onClick={() => setActiveResultTab('qr')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-colors relative ${
                    activeResultTab === 'qr'
                      ? 'text-purple-300 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Scan QR Code
                </button>
              </div>

              {/* Tab 1: Account Info Details */}
              {activeResultTab === 'info' && (
                <div className="space-y-3 bg-[#110d2c] p-4 rounded-2xl border border-purple-500/20 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">Server Host:</span>
                      <div className="flex items-center gap-1 font-semibold text-white">
                        <span>{generatedAccount.server.host}</span>
                        <button
                          onClick={() => handleCopy(generatedAccount.server.host, 'host')}
                          className="p-1 hover:text-purple-300"
                        >
                          {copiedKey === 'host' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">Server IP:</span>
                      <div className="flex items-center gap-1 font-semibold text-white">
                        <span>{generatedAccount.server.ip}</span>
                        <button
                          onClick={() => handleCopy(generatedAccount.server.ip, 'ip')}
                          className="p-1 hover:text-purple-300"
                        >
                          {copiedKey === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">Username:</span>
                      <div className="flex items-center gap-1 font-semibold text-white">
                        <span>{generatedAccount.username}</span>
                        <button
                          onClick={() => handleCopy(generatedAccount.username, 'user')}
                          className="p-1 hover:text-purple-300"
                        >
                          {copiedKey === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">Password / Key:</span>
                      <div className="flex items-center gap-1 font-semibold text-white">
                        <span>{generatedAccount.password}</span>
                        <button
                          onClick={() => handleCopy(generatedAccount.password || '', 'pwd')}
                          className="p-1 hover:text-purple-300"
                        >
                          {copiedKey === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {generatedAccount.uuid && (
                      <div className="col-span-full p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                        <span className="text-slate-400">UUID:</span>
                        <div className="flex items-center gap-1 font-semibold text-white break-all">
                          <span className="text-[11px]">{generatedAccount.uuid}</span>
                          <button
                            onClick={() => handleCopy(generatedAccount.uuid || '', 'uuid')}
                            className="p-1 hover:text-purple-300"
                          >
                            {copiedKey === 'uuid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">SNI / Bug Host:</span>
                      <span className="font-semibold text-purple-300">{generatedAccount.sni}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">Port SSL/TLS:</span>
                      <span className="font-semibold text-white">443, 8443</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">Port Dropbear/SSH:</span>
                      <span className="font-semibold text-white">109, 143, 22</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#19133f] flex justify-between items-center">
                      <span className="text-slate-400">UDP Custom:</span>
                      <span className="font-semibold text-emerald-300">1-65535</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Config URL Link */}
              {activeResultTab === 'config' && (
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={4}
                      value={generatedAccount.configString || ''}
                      className="w-full p-3.5 rounded-2xl bg-[#100c28] border border-purple-500/30 text-xs font-mono text-purple-200 focus:outline-none resize-none break-all"
                    />
                    <button
                      onClick={() => handleCopy(generatedAccount.configString || '', 'cfg')}
                      className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                    >
                      {copiedKey === 'cfg' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Config</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadFile}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1f194c] hover:bg-[#282062] border border-purple-500/30 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4 text-purple-300" />
                      <span>Download Config File (.txt)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Payload */}
              {activeResultTab === 'payload' && generatedAccount.payloadString && (
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={3}
                      value={generatedAccount.payloadString}
                      className="w-full p-3.5 rounded-2xl bg-[#100c28] border border-purple-500/30 text-xs font-mono text-emerald-300 focus:outline-none resize-none"
                    />
                    <button
                      onClick={() => handleCopy(generatedAccount.payloadString || '', 'payload')}
                      className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                    >
                      {copiedKey === 'payload' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste this WebSocket HTTP payload into HTTP Injector, NetMod Syna, or NapsternetV.
                  </p>
                </div>
              )}

              {/* Tab 4: QR Code */}
              {activeResultTab === 'qr' && (
                <div className="flex flex-col items-center justify-center p-6 bg-[#110d2c] rounded-2xl border border-purple-500/20 text-center">
                  {qrDataUrl ? (
                    <div className="p-3 bg-white rounded-2xl shadow-xl mb-3">
                      <img src={qrDataUrl} alt="Tunnel Config QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                    </div>
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                      Generating QR code...
                    </div>
                  )}
                  <p className="text-xs text-slate-300 font-medium">
                    Scan with <strong className="text-purple-300">v2rayNG</strong>, <strong className="text-purple-300">V2Box</strong>, or <strong className="text-purple-300">Sing-box</strong> on your smartphone.
                  </p>
                </div>
              )}

              {/* Quick instructions */}
              <div className="p-3.5 rounded-2xl bg-[#140f34] border border-purple-500/10 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Tip: If your connection fails or is blocked by your ISP, update the <strong>SNI / Bug Host</strong> to your ISP's zero-rated URL or CDN address.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
