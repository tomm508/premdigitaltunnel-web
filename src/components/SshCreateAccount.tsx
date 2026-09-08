import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  CheckCircle2,
  Calendar,
  Layers,
  Radio,
  Download,
  AlertCircle
} from 'lucide-react';
import { TunnelServer, GeneratedAccount } from '../types';
import { User } from 'firebase/auth';
import { db, collection, addDoc, doc, updateDoc } from '../lib/firebase';

interface SshCreateAccountProps {
  server: TunnelServer;
  isDark: boolean;
  currentUser: User | null;
  userBalance: number;
  onBack: () => void;
  onAccountCreated: (account: GeneratedAccount) => void;
  onOpenTopup: () => void;
}

export const SshCreateAccount: React.FC<SshCreateAccountProps> = ({
  server,
  isDark,
  currentUser,
  userBalance,
  onBack,
  onAccountCreated,
  onOpenTopup
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'vip7' | 'vip30'>('free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<GeneratedAccount | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const planPrices = {
    free: 0,
    vip7: 5000,
    vip30: 15000
  };

  const planDays = {
    free: 3,
    vip7: 7,
    vip30: 30
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const price = planPrices[selectedPlan];
    if (price > 0 && userBalance < price) {
      setErrorMessage(`Saldo Anda tidak mencukupi untuk paket VIP (Rp ${price.toLocaleString()}). Silakan Top Up saldo terlebih dahulu.`);
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
          openSsh: 22,
          wsCdn: 80,
          udpCustom: '1 - 65535'
        },
        payloadString: payload,
        createdAt: new Date().toISOString()
      };

      // If user logged in, persist account in Firestore subcollection
      if (currentUser) {
        try {
          if (price > 0) {
            // Deduct balance
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              balance: userBalance - price
            });
          }

          await addDoc(collection(db, 'users', currentUser.uid, 'accounts'), {
            userId: currentUser.uid,
            serverName: `SSH ${server.country}`,
            host: server.host,
            username: username,
            activeDays: activeDays,
            expiresAt: expiryDateStr,
            createdAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("Could not save to firestore history or deduct balance:", dbErr);
        }
      }

      setCreatedAccount(newAccount);
      onAccountCreated(newAccount);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat akun');
      setIsSubmitting(false);
    }
  };

  const getExportText = () => {
    if (!createdAccount) return '';
    return `══════════════════════════════════
❖ PREMDIGITAL SSH TUNNEL VIP ❖
══════════════════════════════════
Server: ${createdAccount.server.country} (${createdAccount.server.city})
Host: ${createdAccount.server.host}
IP: ${createdAccount.server.ip}
Username: ${createdAccount.username}
Password: ${createdAccount.password}
SSL/TLS Port: 443
Dropbear Port: 888, 777, 443
WebSocket CDN Port: 80, 8880
SSH UDP Custom Port: 1 - 65535
Masa Aktif: ${createdAccount.activeDays} Hari (s/d ${createdAccount.expiryDate})
WebSocket Payload:
${createdAccount.payloadString}
══════════════════════════════════
Official Website: https://premdigital.web.id
══════════════════════════════════`;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ganti Lokasi Server</span>
        </button>

        <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          Step 3 of 3: Buat Akun
        </span>
      </div>

      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Server Terpilih: {server.country} ({server.host})</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Create SSH Tunnel Account
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/80 max-w-md mx-auto mt-2">
          Masukkan username & password untuk mengenerate konfigurasi SSH Tunnel instan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Server Technical Specs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-[#140e32] border border-purple-500/20 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              <span>Detail Port & Protokol</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/15 flex justify-between">
                <span className="text-slate-400">Server Host</span>
                <span className="font-mono text-purple-300 font-medium">{server.host}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/15 flex justify-between">
                <span className="text-slate-400">SSL / TLS Port</span>
                <span className="font-mono text-emerald-400 font-bold">443</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/15 flex justify-between">
                <span className="text-slate-400">Dropbear Port</span>
                <span className="font-mono text-white font-medium">888, 777, 443</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/15 flex justify-between">
                <span className="text-slate-400">WebSocket CDN Port</span>
                <span className="font-mono text-white font-medium">80, 8880</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/15 flex justify-between">
                <span className="text-slate-400">SSH UDP Custom</span>
                <span className="font-mono text-pink-400 font-bold">1 - 65535</span>
              </div>
            </div>

            {/* WebSocket Payload ready to copy */}
            <div className="mt-4 pt-3 border-t border-purple-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-300">WebSocket Payload</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`GET / HTTP/1.1[crlf]Host: ${server.host}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf][crlf]`, 'ws-payload')}
                  className="text-[10px] text-purple-400 hover:text-purple-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'ws-payload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ws-payload' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e0a25] border border-purple-500/20 font-mono text-[10px] text-slate-300 break-all select-all">
                GET / HTTP/1.1[crlf]Host: {server.host}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf][crlf]
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Create / Result Display */}
        <div className="lg:col-span-7">
          {!createdAccount ? (
            <div className="p-6 rounded-3xl bg-[#140e32] border border-purple-500/25 shadow-2xl">
              <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Form Pembuatan Akun</span>
              </h3>

              {errorMessage && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                  <span>{errorMessage}</span>
                  {selectedPlan !== 'free' && (
                    <button
                      onClick={onOpenTopup}
                      className="ml-2 font-bold underline cursor-pointer"
                    >
                      Top Up Sekarang
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username Akun
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="contoh: user01"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Hanya huruf kecil dan angka</span>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password Akun
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="contoh: pass123"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
                    />
                  </div>
                </div>

                {/* Plan Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Pilihan Paket Aktif
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan('free')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPlan === 'free'
                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                          : 'bg-purple-950/30 border-purple-500/20 text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-emerald-400 font-bold block">GRATIS TRIAL</span>
                      <span className="text-xs font-bold text-white block">3 Hari</span>
                      <span className="text-[10px] text-slate-400">Rp 0</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan('vip7')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPlan === 'vip7'
                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                          : 'bg-purple-950/30 border-purple-500/20 text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-purple-300 font-bold block">VIP EXTEND</span>
                      <span className="text-xs font-bold text-white block">7 Hari</span>
                      <span className="text-[10px] text-slate-400">Rp 5.000</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan('vip30')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPlan === 'vip30'
                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-md'
                          : 'bg-purple-950/30 border-purple-500/20 text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-amber-300 font-bold block">VIP BULANAN</span>
                      <span className="text-xs font-bold text-white block">30 Hari</span>
                      <span className="text-[10px] text-slate-400">Rp 15.000</span>
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSubmitting ? 'Generating SSH Account...' : 'Create SSH Tunnel Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Created Result Card */
            <div className="p-6 rounded-3xl bg-[#140e32] border border-emerald-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Akun Berhasil Dibuat!
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {createdAccount.activeDays} Hari Aktif
                </span>
              </div>

              {/* Account Quick Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                  <span className="text-slate-400 block text-[11px]">Username</span>
                  <span className="font-mono font-bold text-white text-sm">{createdAccount.username}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                  <span className="text-slate-400 block text-[11px]">Password</span>
                  <span className="font-mono font-bold text-white text-sm">{createdAccount.password}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                  <span className="text-slate-400 block text-[11px]">Host / Domain</span>
                  <span className="font-mono text-purple-300 truncate block">{createdAccount.server.host}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                  <span className="text-slate-400 block text-[11px]">Expired Date</span>
                  <span className="font-medium text-emerald-400">{createdAccount.expiryDate}</span>
                </div>
              </div>

              {/* Full copyable account block */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Format Akun Lengkap:</span>
                  <button
                    onClick={() => handleCopy(getExportText(), 'full-acc')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all cursor-pointer"
                  >
                    {copiedKey === 'full-acc' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'full-acc' ? 'Tersalin!' : 'Copy Akun'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={7}
                  value={getExportText()}
                  className="w-full p-3 rounded-2xl bg-[#0d0921] border border-purple-500/30 text-slate-200 font-mono text-[11px] outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setCreatedAccount(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-purple-950 hover:bg-purple-900 border border-purple-500/30 cursor-pointer"
                >
                  Buat Akun Lain
                </button>
                <button
                  onClick={onBack}
                  className="py-3 px-4 rounded-xl font-bold text-xs text-purple-300 hover:text-white bg-purple-900/30 cursor-pointer"
                >
                  Ganti Server
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
