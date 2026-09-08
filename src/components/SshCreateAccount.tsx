import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon, 
  Lock, 
  Server,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Globe2,
  BarChart3,
  Star,
  ChevronRight
} from 'lucide-react';
import { TunnelServer, GeneratedAccount } from '../types';
import { User } from 'firebase/auth';
import { db, collection, addDoc, doc, updateDoc } from '../lib/firebase';

interface SshCreateAccountProps {
  server: TunnelServer | null;
  isDark: boolean;
  currentUser: User | null;
  userBalance: number;
  onBack: () => void;
  onAccountCreated: (account: GeneratedAccount) => void;
  onOpenTopup: () => void;
  onOpenLogin: () => void;
}

export const SshCreateAccount: React.FC<SshCreateAccountProps> = ({
  server,
  isDark,
  currentUser,
  userBalance,
  onBack,
  onAccountCreated,
  onOpenTopup,
  onOpenLogin
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'vip3' | 'vip7' | 'vip30'>('free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const planPrices = {
    free: 0,
    vip3: 750,
    vip7: 1650,
    vip30: 6250
  };

  const planDays = {
    free: 3,
    vip3: 3,
    vip7: 7,
    vip30: 30
  };

  useEffect(() => {
    if (!server || !server.id) {
      onBack();
    }
  }, [server, onBack]);

  // If server is not ready yet, return a blank slate to prevent route errors
  if (!server || !server.id) {
    return <div className="min-h-screen"></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate Server Capacity for Free Tier
    if (selectedPlan === 'free' && server.used >= server.capacity) {
      setErrorMessage(`Maaf, kapasitas server ${server.country} sedang penuh (${server.used}/${server.capacity}). Silakan pilih server lain atau gunakan paket Premium.`);
      return;
    }

    const price = planPrices[selectedPlan];
    
    // Validate Login for Premium
    if (price > 0 && !currentUser) {
      setErrorMessage('Anda harus Login atau Daftar terlebih dahulu untuk menggunakan paket Premium.');
      return;
    }

    // Validate Balance for Premium
    if (price > 0 && userBalance < price) {
      setErrorMessage(`Saldo Anda kosong / tidak mencukupi untuk paket premium (Rp ${price.toLocaleString()}). Silakan Top Up terlebih dahulu.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const activeDays = planDays[selectedPlan];
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + activeDays);
      const expiryDateStr = expiry.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const payload = `GET / HTTP/1.1[crlf]Host: ${server.host}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf][crlf]`;

      const newAccount: GeneratedAccount = {
        protocol: 'ssh',
        server,
        username,
        password,
        activeDays,
        expiryDate: expiryDateStr,
        sni: server.host,
        ports: {
          sslTls: 443,
          dropbear: 888,
          wsStunnel: 443,
          wsDropbear: 443,
          wsOpenVpn: 2086,
          squid: 3128,
          udpgw: '7100-7900'
        },
        payload
      };

      if (currentUser) {
        if (price > 0) {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
             balance: userBalance - price
          });
        }
        await addDoc(collection(db, 'users', currentUser.uid, 'accounts'), {
          ...newAccount,
          createdAt: new Date().toISOString()
        });
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onAccountCreated(newAccount);
      }, 1500);

    } catch (error: any) {
      setIsSubmitting(false);
      setErrorMessage(error.message || 'Terjadi kesalahan saat membuat akun.');
    }
  };

  return (
    <div className={`py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Top Banner */}
      <div className="flex justify-center mb-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a1b54] border border-[#3e2b7a] text-purple-200 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
          <span>Free Ssh Tunnel Server {server.country}</span>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-white">
        Create Ssh Tunnel Account <br/> {server.country} {server.countryCode === 'SG' ? 'SG1' : 'ID1'} SSH
      </h1>
      
      <p className="text-center text-[15px] leading-relaxed text-slate-300 max-w-2xl mx-auto mb-10">
        Get instant access to a secure and unrestricted internet experience with our high-performance Ssh Tunnel server located in {server.country}.
      </p>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
             <Clock className="w-5 h-5 text-emerald-400" />
           </div>
           <span className="text-xl font-bold text-white mb-1">3</span>
           <span className="text-xs text-slate-400 font-medium">Days Active</span>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
             <Server className="w-5 h-5 text-blue-400" />
           </div>
           <span className="text-[15px] font-bold text-white mb-1">{server.host}</span>
           <span className="text-xs text-slate-400 font-medium">Ultahost, Inc.</span>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
             <MapPin className="w-5 h-5 text-purple-400" />
           </div>
           <span className="text-[15px] font-bold text-white mb-1">{server.country}</span>
           <span className="text-xs text-slate-400 font-medium">Server Location</span>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
             <ShieldCheck className="w-5 h-5 text-indigo-400" />
           </div>
           <span className="text-[15px] font-bold text-white mb-1">{server.countryCode === 'SG' ? 'SG1 SSH' : 'ID1 SSH'}</span>
           <span className="text-xs text-slate-400 font-medium">Server Name</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[#1e1a38] rounded-3xl border border-[#30285a] p-6 sm:p-8 mb-12 shadow-xl">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
             <Star className="w-6 h-6 fill-indigo-400 text-indigo-400" />
          </div>
          <div className="flex-1">
             <h2 className="text-xl font-bold text-white mb-1">Account Creation</h2>
             <p className="text-xs text-slate-400">Get your free Ssh Tunnel account in seconds</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="text-rose-400 text-sm">{errorMessage}</p>
              {errorMessage.includes('Saldo') && (
                <button
                  type="button"
                  onClick={onOpenTopup}
                  className="mt-3 px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors"
                >
                  Top Up Saldo Sekarang
                </button>
              )}
              {errorMessage.includes('Login atau Daftar') && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="mt-3 px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold transition-colors"
                >
                  Login / Daftar Sekarang
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
           {/* Username */}
           <div>
             <label className="block text-[13px] font-medium text-slate-300 mb-2">Username</label>
             <div className="relative">
               <input
                 type="text"
                 required
                 value={username}
                 onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                 placeholder="Username123"
                 className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-[#15112e] border border-[#2a234f] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-sm transition-colors"
               />
               <UserIcon className="w-5 h-5 text-slate-500 absolute right-4 top-3.5" />
             </div>
             <p className="mt-2 text-[11px] text-slate-500">Enter letters and numbers (5-12 characters)</p>
           </div>

           {/* Password */}
           <div>
             <label className="block text-[13px] font-medium text-slate-300 mb-2">Password</label>
             <div className="relative">
               <input
                 type="password"
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Password"
                 className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-[#15112e] border border-[#2a234f] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-sm transition-colors"
               />
               <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-4" />
             </div>
             <p className="mt-2 text-[11px] text-slate-500">Minimum 5 characters for security</p>
           </div>

           {/* Billing Tier */}
           <div className="pt-2">
             <label className="block text-[13px] font-medium text-slate-300 mb-3">Billing Tier</label>
             
             {/* Free Tier Option */}
             <div 
                onClick={() => setSelectedPlan('free')}
                className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all mb-3 border ${
                  selectedPlan === 'free' 
                    ? 'bg-[#2a1b54] border-indigo-500' 
                    : 'bg-[#15112e] border-[#2a234f] hover:border-[#3e2b7a]'
                }`}
             >
                <div>
                   <h4 className="font-bold text-white text-sm">Free</h4>
                   <p className="text-[11px] text-slate-400 mt-0.5">Limited access</p>
                </div>
                <div className="font-bold text-white">Rp 0</div>
             </div>

             {/* 3 Days Premium Option */}
             <div 
                onClick={() => setSelectedPlan('vip3')}
                className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all mb-3 border ${
                  selectedPlan === 'vip3' 
                    ? 'bg-[#2a1b54] border-indigo-500' 
                    : 'bg-[#15112e] border-[#2a234f] hover:border-[#3e2b7a]'
                }`}
             >
                <div>
                   <h4 className="font-bold text-white text-sm">3 Days Premium</h4>
                   <p className="text-[11px] text-slate-400 mt-0.5">Short term access</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] text-slate-500 line-through">Rp 1.500</span>
                     <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-50%</span>
                   </div>
                   <div className="font-bold text-emerald-400">Rp 750</div>
                </div>
             </div>

             {/* 7 Days Premium Option */}
             <div 
                onClick={() => setSelectedPlan('vip7')}
                className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all mb-3 border ${
                  selectedPlan === 'vip7' 
                    ? 'bg-[#2a1b54] border-indigo-500' 
                    : 'bg-[#15112e] border-[#2a234f] hover:border-[#3e2b7a]'
                }`}
             >
                <div>
                   <h4 className="font-bold text-white text-sm">7 Days Premium</h4>
                   <p className="text-[11px] text-slate-400 mt-0.5">Best for weekly</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] text-slate-500 line-through">Rp 3.300</span>
                     <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-50%</span>
                   </div>
                   <div className="font-bold text-emerald-400">Rp 1.650</div>
                </div>
             </div>

             {/* 30 Days Premium Option */}
             <div 
                onClick={() => setSelectedPlan('vip30')}
                className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedPlan === 'vip30' 
                    ? 'bg-[#2a1b54] border-indigo-500' 
                    : 'bg-[#15112e] border-[#2a234f] hover:border-[#3e2b7a]'
                }`}
             >
                <div>
                   <h4 className="font-bold text-white text-sm">30 Days Premium</h4>
                   <p className="text-[11px] text-slate-400 mt-0.5">Full month access</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] text-slate-500 line-through">Rp 12.500</span>
                     <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-50%</span>
                   </div>
                   <div className="font-bold text-emerald-400">Rp 6.250</div>
                </div>
             </div>
           </div>

           <button
             type="submit"
             disabled={isSubmitting || !username || !password}
             className="w-full mt-4 py-4 rounded-xl font-bold text-[15px] text-white bg-[#5527d6] hover:bg-[#6839eb] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             {isSubmitting ? 'Creating...' : 'Create Ssh Tunnel Account'}
           </button>
        </form>
      </div>

      {/* Premium Features Info */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
          <span>Premium Features</span>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3">Unlock Premium Features</h2>
      <p className="text-center text-[15px] text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
        Get the most out of your Ssh Tunnel experience with our premium subscription plans. <span className="text-purple-400 font-medium">Upgrade today</span> and enjoy unlimited access to all features.
      </p>

      {/* 6 Grid Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-6">
           <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
             <Zap className="w-5 h-5 text-emerald-400" />
           </div>
           <h3 className="font-bold text-white mb-2 text-[15px]">Lightning Fast Speed</h3>
           <p className="text-xs text-slate-400 leading-relaxed">Access our premium servers with optimized routing and unlimited bandwidth for the fastest possible connection speeds.</p>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-6">
           <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
             <Lock className="w-5 h-5 text-blue-400" />
           </div>
           <h3 className="font-bold text-white mb-2 text-[15px]">Advanced Security</h3>
           <p className="text-xs text-slate-400 leading-relaxed">Military-grade encryption with advanced obfuscation techniques to bypass even the most sophisticated network restrictions.</p>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-6">
           <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
             <CheckCircle2 className="w-5 h-5 text-pink-400" />
           </div>
           <h3 className="font-bold text-white mb-2 text-[15px]">Priority Support</h3>
           <p className="text-xs text-slate-400 leading-relaxed">24/7 premium customer support with dedicated account managers and instant response times for all your needs.</p>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-6">
           <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
             <ShieldCheck className="w-5 h-5 text-indigo-400" />
           </div>
           <h3 className="font-bold text-white mb-2 text-[15px]">Multi Platform</h3>
           <p className="text-xs text-slate-400 leading-relaxed">Support on Windows, Android, iOS, macOS, OpenWRT, Linux — all platforms supported with native apps.</p>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-6">
           <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4">
             <Globe2 className="w-5 h-5 text-teal-400" />
           </div>
           <h3 className="font-bold text-white mb-2 text-[15px]">Global Servers</h3>
           <p className="text-xs text-slate-400 leading-relaxed">Access to 50+ premium servers worldwide with automatic server selection for optimal performance.</p>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-6">
           <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
             <BarChart3 className="w-5 h-5 text-orange-400" />
           </div>
           <h3 className="font-bold text-white mb-2 text-[15px]">Usage Analytics</h3>
           <p className="text-xs text-slate-400 leading-relaxed">Detailed usage statistics, connection logs, and performance analytics to monitor your VPN usage patterns.</p>
        </div>
      </div>

    </div>
  );
};
