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
  Globe,
  Globe2,
  BarChart3,
  Star,
  ChevronRight
} from 'lucide-react';
import { TunnelServer, GeneratedAccount } from '../types';
import { User } from 'firebase/auth';
import { db, collection, addDoc, doc, updateDoc, setDoc, increment } from '../lib/firebase';
import { onSnapshot } from 'firebase/firestore';
import { Turnstile } from '@marsidev/react-turnstile';

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
  const [customSni, setCustomSni] = useState<string>(server?.host || '');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'vip3' | 'vip7' | 'vip30'>('free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pricing, setPricing] = useState<{ssh: number, discount: number}>({ ssh: 1500, discount: 50 });
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [freeLimit, setFreeLimit] = useState<number>(10);

  useEffect(() => {
    if (server?.host) {
      setCustomSni(server.host);
    }
  }, [server?.host]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPricing({
          ssh: data.pricing?.ssh || 1500,
          discount: data.pricing?.discount ?? 50
        });
        setTurnstileSiteKey(data.turnstileSiteKey || '');
        setFreeLimit(data.freeAccountLimit || 10);
      }
    });
    return () => unsub();
  }, []);

  const calculatePrice = (base: number) => {
    return base * (1 - pricing.discount / 100);
  };

  const planPrices = {
    free: 0,
    vip3: calculatePrice(1250),
    vip7: calculatePrice(2500),
    vip30: calculatePrice(pricing.ssh)
  };

  const planBasePrices = {
    free: 0,
    vip3: 1250,
    vip7: 2500,
    vip30: pricing.ssh
  };

  const planDays = {
    free: 1,
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

    // Validate Turnstile
    if (turnstileSiteKey && !turnstileToken) {
      setErrorMessage('Silakan selesaikan verifikasi captcha (Cloudflare) terlebih dahulu.');
      return;
    }

    // Validate Server Capacity for Free Tier
    const currentUsed = Math.max(0, server.usedSlots || 0);
    const effectiveFreeLimit = freeLimit || 10;
    if (selectedPlan === 'free' && currentUsed >= effectiveFreeLimit) {
      setErrorMessage(`Server Full! Kuota pembuatan akun gratis untuk server ${server.country} sedang penuh (${currentUsed}/${effectiveFreeLimit}). Silakan pilih server lain atau gunakan paket Premium.`);
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

      const cleanSni = (customSni || server.host).trim();
      const payload = `GET / HTTP/1.1[crlf]Host: ${cleanSni}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf][crlf]`;
      const configStr = `ssh://${username}:${password}@${server.host}:22`;

      const newAccount: GeneratedAccount = {
        protocol: 'ssh',
        server,
        username,
        password,
        activeDays,
        expiryDate: expiryDateStr,
        sni: cleanSni,
        ports: {
          sslTls: 443,
          dropbear: 888,
          openSsh: 22,
          wsCdn: 80,
          udpCustom: '1-65535'
        },
        payloadString: payload,
        configString: configStr,
        createdAt: new Date().toISOString()
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
          type: price > 0 ? 'premium' : 'free',
          status: 'active',
          createdAt: new Date().toISOString()
        });

        await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
          type: 'service_creation',
          title: `Buat Akun SSH (${price > 0 ? 'Premium' : 'Gratis'})`,
          description: `${server.country} (${server.city}) - User: ${username}`,
          amount: price,
          status: 'success',
          paymentMethod: price > 0 ? 'Saldo Akun' : 'Gratis',
          createdAt: new Date().toISOString(),
          protocol: 'ssh',
          serverName: server.country
        });
      }

      // Add command to VPS queue for auto-creation
      try {
        // Increment server used slots
        if (server.id) {
          try {
            const nodeRef = doc(db, 'vps_nodes', server.id);
            await setDoc(nodeRef, {
              usedSlots: increment(1),
              onlineUsers: increment(1)
            }, { merge: true });
          } catch (e) {
            console.warn("Could not increment server node slots:", e);
          }
        }

        const cmdRef = await addDoc(collection(db, 'vps_commands'), {
          serverId: server.id,
          action: 'CREATE_ACCOUNT',
          protocol: 'ssh',
          username,
          password,
          activeDays: Number(activeDays),
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // Listen for status change from the VPS daemon
        const unsubscribe = onSnapshot(cmdRef, (snap) => {
          const data = snap.data();
          if (data && data.status === 'success') {
            unsubscribe();
            setIsSubmitting(false);
            onAccountCreated(newAccount);
          } else if (data && data.status === 'error') {
            unsubscribe();
            setIsSubmitting(false);
            setErrorMessage(data.message || 'VPS failed to create account.');
          }
        });

        // Fallback if VPS daemon takes time to respond
        setTimeout(() => {
          unsubscribe();
          setIsSubmitting(false);
          onAccountCreated(newAccount);
        }, 5000);
      } catch (cmdErr) {
        console.warn("Gagal mengirim command ke VPS:", cmdErr);
        setIsSubmitting(false);
        setErrorMessage('Gagal menghubungi server database.');
      }

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
           <span className="text-xl font-bold text-white mb-1">24 Hours</span>
           <span className="text-xs text-slate-400 font-medium">Duration</span>
        </div>
        <div className="bg-[#15112e] border border-[#2a234f] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
             <Server className="w-5 h-5 text-blue-400" />
           </div>
           <span className="text-[15px] font-bold text-white mb-1 truncate max-w-full px-2">{server.host}</span>
           <span className="text-xs text-slate-400 font-medium">Host / Cloudflare Domain</span>
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
           <span className="text-[15px] font-bold text-white mb-1 truncate max-w-full px-2">{server.city || server.id}</span>
           <span className="text-xs text-slate-400 font-medium">Server Node</span>
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

           {/* SNI / Bug Host */}
           <div>
             <div className="flex items-center justify-between mb-2">
               <label className="block text-[13px] font-medium text-slate-300">SNI / Bug Host (Opsional)</label>
               <span className="text-[11px] text-indigo-400 font-mono">Default: {server.host}</span>
             </div>
             <div className="relative">
               <input
                 type="text"
                 value={customSni}
                 onChange={(e) => setCustomSni(e.target.value.trim())}
                 placeholder={server.host}
                 className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-[#15112e] border border-[#2a234f] text-emerald-400 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-sm transition-colors"
               />
               <Globe className="w-4 h-4 text-slate-500 absolute right-4 top-4" />
             </div>
             <p className="mt-2 text-[11px] text-slate-500">Domain / SNI yang disisipkan ke payload HTTP injector & konfigurasi VPN</p>

             {/* Quick Bug Host Presets */}
             <div className="flex flex-wrap gap-1.5 mt-2.5">
               <button
                 type="button"
                 onClick={() => setCustomSni(server.host)}
                 className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                   customSni === server.host 
                     ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold' 
                     : 'bg-[#15112e] border-[#2a234f] text-slate-400 hover:text-white'
                 }`}
               >
                 Default Host
               </button>
               {['m.youtube.com', 'zoom.us', 'quiz.int.vidio.com', 'v.whatsapp.net'].map((preset) => (
                 <button
                   key={preset}
                   type="button"
                   onClick={() => setCustomSni(preset)}
                   className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                     customSni === preset 
                       ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold' 
                       : 'bg-[#15112e] border-[#2a234f] text-slate-400 hover:text-white'
                   }`}
                 >
                   {preset}
                 </button>
               ))}
             </div>
           </div>

           {/* Billing Tier */}
           <div className="pt-2">
             <label className="block text-[13px] font-medium text-slate-300 mb-3">Billing Tier</label>
             
             {/* Free Tier Option */}
             <div 
                onClick={() => {
                  const curUsed = server.usedSlots || 0;
                  const lim = freeLimit || 10;
                  if (curUsed >= lim) {
                    setErrorMessage(`Server Full! Kuota pembuatan akun gratis server ${server.country} telah penuh (${curUsed}/${lim}). Silakan pilih paket VIP untuk akses langsung atau pilih server lain.`);
                  } else {
                    setSelectedPlan('free');
                    setErrorMessage(null);
                  }
                }}
                className={`relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all mb-3 border ${
                  (server.usedSlots || 0) >= (freeLimit || 10)
                    ? 'bg-rose-950/20 border-rose-500/40 opacity-90'
                    : selectedPlan === 'free' 
                    ? 'bg-[#2a1b54] border-indigo-500' 
                    : 'bg-[#15112e] border-[#2a234f] hover:border-[#3e2b7a]'
                }`}
             >
                <div>
                   <div className="flex items-center gap-2">
                     <h4 className="font-bold text-white text-sm">24 Hours Free</h4>
                     {(server.usedSlots || 0) >= (freeLimit || 10) && (
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                         SERVER FULL ({server.usedSlots || 0}/{freeLimit || 10})
                       </span>
                     )}
                   </div>
                   <p className={`text-[11px] mt-0.5 ${(server.usedSlots || 0) >= (freeLimit || 10) ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
                     {(server.usedSlots || 0) >= (freeLimit || 10) ? `Kuota harian penuh (${server.usedSlots || 0}/${freeLimit || 10}) — Gunakan paket VIP` : 'Limited access'}
                   </p>
                </div>
                <div className={`font-bold ${(server.usedSlots || 0) >= (freeLimit || 10) ? 'text-rose-400' : 'text-white'}`}>
                  {(server.usedSlots || 0) >= (freeLimit || 10) ? 'FULL' : 'Rp 0'}
                </div>
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
                   {pricing.discount > 0 && (
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-500 line-through">Rp {planBasePrices.vip3.toLocaleString('id-ID')}</span>
                       <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>
                     </div>
                   )}
                   <div className="font-bold text-emerald-400">Rp {planPrices.vip3.toLocaleString('id-ID')}</div>
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
                   {pricing.discount > 0 && (
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-500 line-through">Rp {planBasePrices.vip7.toLocaleString('id-ID')}</span>
                       <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>
                     </div>
                   )}
                   <div className="font-bold text-emerald-400">Rp {planPrices.vip7.toLocaleString('id-ID')}</div>
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
                   {pricing.discount > 0 && (
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-500 line-through">Rp {planBasePrices.vip30.toLocaleString('id-ID')}</span>
                       <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>
                     </div>
                   )}
                   <div className="font-bold text-emerald-400">Rp {planPrices.vip30.toLocaleString('id-ID')}</div>
                </div>
             </div>
           </div>

           {turnstileSiteKey && (
             <div className="mt-6 flex justify-center">
               <Turnstile 
                 siteKey={turnstileSiteKey} 
                 onSuccess={(token) => setTurnstileToken(token)}
                 onError={() => setTurnstileToken(null)}
                 onExpire={() => setTurnstileToken(null)}
               />
             </div>
           )}

           <button
             type="submit"
             disabled={isSubmitting || !username || !password}
             className="w-full mt-6 py-4 rounded-xl font-bold text-[15px] text-white bg-blue-600 hover:bg-blue-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             {isSubmitting ? 'Creating...' : 'Create SSH'}
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
