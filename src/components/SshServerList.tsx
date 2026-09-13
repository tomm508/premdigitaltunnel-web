import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Sparkles,
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Zap,
  ShieldCheck,
  Star,
  RefreshCw
} from 'lucide-react';
import { TunnelServer } from '../types';
import { subscribeVpsNodes, UnifiedServerNode } from '../lib/serverSync';

interface SshServerListProps {
  isDark: boolean;
  onSelectServer: (server: TunnelServer) => void;
  onBack: () => void;
}

export const SshServerList: React.FC<SshServerListProps> = ({
  isDark,
  onSelectServer,
  onBack
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ID' | 'SG'>('all');
  const [servers, setServers] = useState<UnifiedServerNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 8,
    minutes: 48,
    seconds: 42
  });

  // Subscribe to live VPS heartbeats from Firestore
  useEffect(() => {
    const unsub = subscribeVpsNodes((liveServers) => {
      setServers(liveServers);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Calculate countdown to next 12:00 reset
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const nextResetHour = currentHour < 12 ? 12 : 24;
      const target = new Date(now);
      target.setHours(nextResetHour, 0, 0, 0);
      
      const diffMs = target.getTime() - now.getTime();
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sshServers = servers.filter(s => s.supportedProtocols.includes('ssh'));
  const filteredServers = activeFilter === 'all' 
    ? sshServers 
    : sshServers.filter(s => s.countryCode === activeFilter);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Top Banner */}
      <div className="flex justify-center mb-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a1b54] border border-[#3e2b7a] text-purple-200 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
          <span>Free Ssh Tunnel Server List</span>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-white">
        Select Ssh Tunnel Server
      </h1>
      
      <p className="text-center text-[15px] leading-relaxed text-slate-300 max-w-3xl mx-auto mb-6">
        JagoVPN provides fast, free SSH servers with AIO SSH tunneling (SSH WebSocket, Stunnel SSH UDP ZIVPN). 
        Create a free SSH account (7 Days/ 30 Days/ 60 Days), use ports 80/443 on restricted Wi-Fi, and enjoy low-latency tunneling with a strict no-logs policy.
      </p>

      {/* Checkmarks */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-10 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Choose nearby region for lower latency</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>Consistent performance guaranteed</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          <span>No-logs policy</span>
        </div>
      </div>

      {/* Enterprise Grade Box */}
      <div className="bg-[#1e1a38] rounded-3xl border border-[#30285a] p-6 sm:p-8 mb-12 shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
             <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
             <h2 className="text-xl font-bold text-white mb-1">Free Premium Ssh Tunnel Service</h2>
             <p className="text-xs text-slate-400">Enterprise-Grade Security & Speed</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between bg-[#15112e] rounded-2xl border border-[#2a234f] px-5 py-4 mb-6">
           <div className="text-[13px] text-slate-300 mb-2 sm:mb-0">
             <span className="text-purple-400 font-medium">Reset Time:</span> Setiap Hari, Pukul 12:00 PM & 12:00 AM (GMT+7)
           </div>
           <div className="flex items-center gap-3">
             <span className="text-[13px] text-slate-400 font-medium">Countdown:</span>
             <div className="font-mono text-xl font-bold text-white tracking-widest">
                {format2(timeLeft.hours)}:{format2(timeLeft.minutes)}:{format2(timeLeft.seconds)}
             </div>
           </div>
        </div>

        <p className="text-[14px] leading-relaxed text-slate-300 mb-8">
          Transform your internet experience with <span className="text-purple-400 font-medium">premium-grade Ssh Tunnel VPN!</span> Get unlimited bandwidth, ultra-low latency, and military-grade <span className="text-purple-400 font-medium">AES-256 encryption.</span> Our global network spans Indonesia, Singapore, and strategic locations worldwide—perfect for 4K streaming, competitive gaming, and lightning-fast browsing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Feature 1 */}
           <div className="bg-[#15112e] rounded-2xl border border-[#2a234f] p-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-bold text-white mb-2 text-[15px]">Instant Setup</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">Create your account in seconds with automated activation. No waiting, no delays.</p>
           </div>
           {/* Feature 2 */}
           <div className="bg-[#15112e] rounded-2xl border border-[#2a234f] p-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white mb-2 text-[15px]">Smart Reset</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">Account limits automatically reset every 12 hours for fair access to all users.</p>
           </div>
           {/* Feature 3 */}
           <div className="bg-[#15112e] rounded-2xl border border-[#2a234f] p-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-2 text-[15px]">Zero-Log Policy</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">Complete privacy with zero activity logging. Your data stays yours, always.</p>
           </div>
        </div>
      </div>

      {/* Break through geo-blocks text */}
      <p className="text-center text-[15px] leading-relaxed text-slate-300 max-w-3xl mx-auto mb-12">
        Break through geo-blocks, secure your data on public Wi-Fi, and access streaming platforms from anywhere. Our cutting-edge <span className="font-medium text-white">Ssh Tunnel</span> protocol ensures maximum speed and security. <span className="text-purple-400 font-medium">Join thousands of users and unlock the internet's full potential!</span> 🚀✨
      </p>

      {/* Choose Service title */}
      <h2 className="text-3xl font-bold text-center text-white mb-2">Choose Service Ssh Tunnel</h2>
      <p className="text-center text-[15px] text-slate-300 mb-8">Select your preferred server location for optimal performance</p>

      {/* Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveFilter('ID')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeFilter === 'ID' || activeFilter === 'all'
              ? 'bg-[#2a1b54] text-white border border-[#4a358c]'
              : 'bg-[#1e1a38] text-slate-400 border border-[#30285a] hover:bg-[#2a1b54]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          SSH TUNNEL Indonesia
        </button>
        <button
          onClick={() => setActiveFilter('SG')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeFilter === 'SG' || activeFilter === 'all'
              ? 'bg-[#2a1b54] text-white border border-[#4a358c]'
              : 'bg-[#1e1a38] text-slate-400 border border-[#30285a] hover:bg-[#2a1b54]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          SSH TUNNEL Singapore
        </button>
      </div>

      {/* Servers List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-4" />
            <p className="text-slate-400">Menghubungkan ke VPS API...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <p className="text-rose-300 font-medium">{error}</p>
            <button 
              onClick={fetchServers}
              className="mt-4 px-6 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-sm font-bold transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-[#15112e] rounded-3xl border border-[#2a234f]">
            Tidak ada server yang tersedia saat ini.
          </div>
        ) : (
          filteredServers.map((server) => {
            const limitCreated = server.limitCreated ?? 20;
            const leftCreated = server.leftCreated ?? 20;
            const freeDays = server.freeActiveDays ?? 3;

            return (
              <div key={server.id} className="bg-[#15112e] border border-[#2a234f] rounded-3xl p-6 md:p-8">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-bold tracking-wider mb-3">
                        {server.countryCode} SSH
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ssh Tunnel {server.country}</h3>
                   </div>
                 <div className="text-5xl drop-shadow-lg shadow-sm overflow-hidden rounded-md border border-slate-700/50">
                    {server.flag}
                 </div>
               </div>

               {/* 3 Metrics */}
               <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#1e1a38] border border-[#30285a] rounded-2xl py-4 flex flex-col items-center justify-center">
                     <span className="text-2xl font-bold text-white mb-1">{freeDays}</span>
                     <span className="text-[11px] text-slate-400 font-medium text-center px-2">Free Active Days</span>
                  </div>
                  <div className="bg-[#1e1a38] border border-[#30285a] rounded-2xl py-4 flex flex-col items-center justify-center">
                     <span className={`text-2xl font-bold mb-1 ${server.status === 'Online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {server.status === 'Online' ? `${server.ping}ms` : 'Timeout'}
                     </span>
                     <span className="text-[11px] text-slate-400 font-medium text-center px-2">Ping Latency</span>
                  </div>
                  <div className="bg-[#1e1a38] border border-[#30285a] rounded-2xl py-4 flex flex-col items-center justify-center">
                     <div className="h-[32px] flex items-center justify-center mb-1">
                       {server.status === 'Online' ? (
                         <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           Active
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 font-bold text-rose-400">
                           <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                           Offline
                         </div>
                       )}
                     </div>
                     <span className="text-[11px] text-slate-400 font-medium text-center px-2">Server Status</span>
                  </div>
               </div>

               {/* Premium Extensions */}
               <div className="bg-[#1e1a38] border border-[#30285a] rounded-2xl p-5 mb-5">
                  <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                           <span className="text-emerald-400 text-[10px] font-bold">$</span>
                        </div>
                        <span className="text-sm font-bold text-slate-200">Premium Extensions</span>
                     </div>
                     <span className="text-[10px] font-bold text-slate-400 bg-[#15112e] border border-[#2a234f] px-2 py-1 rounded">Harga dalam IDR</span>
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">3 Days</span>
                        <div className="flex items-center gap-2">
                           <span className="text-slate-500 line-through">Rp 1.500</span>
                           <span className="text-emerald-400 font-bold">Rp 750</span>
                           <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-50%</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">7 Days</span>
                        <div className="flex items-center gap-2">
                           <span className="text-slate-500 line-through">Rp 3.300</span>
                           <span className="text-emerald-400 font-bold">Rp 1.650</span>
                           <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-50%</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">30 Days</span>
                        <div className="flex items-center gap-2">
                           <span className="text-slate-500 line-through">Rp 12.500</span>
                           <span className="text-emerald-400 font-bold">Rp 6.250</span>
                           <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-50%</span>
                        </div>
                     </div>
                  </div>
                  <div className="mt-5 text-center">
                     <span className="text-[12px] text-emerald-400 font-medium">Upgrade anytime in dashboard</span>
                  </div>
               </div>

               {/* Device Limit Notice */}
               <div className="flex gap-3 bg-[#3f1f16] border border-[#7d3b25] rounded-xl p-4 mb-5">
                 <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                 <div>
                    <h4 className="text-[13px] font-bold text-white mb-1">Device Limit Notice</h4>
                    <p className="text-[12px] text-orange-200 leading-relaxed">
                       Maximum 2 device per account. Using multiple devices simultaneously will be detected as abuse and your account will be banned immediately.
                    </p>
                 </div>
               </div>

               {/* Select Server Button */}
               <button
                  onClick={() => onSelectServer(server)}
                  disabled={server.status !== 'Online'}
                  className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-colors mt-2 ${
                    server.status === 'Online'
                      ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                      : 'bg-slate-700/60 text-slate-400 border border-rose-500/30 cursor-not-allowed opacity-80'
                  }`}
               >
                  {server.status === 'Online' ? (
                    <>
                      <span>Select Server</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Server Offline (Node Belum Aktif)</span>
                    </>
                  )}
               </button>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
