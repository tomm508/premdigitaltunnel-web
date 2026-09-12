import React, { useEffect } from 'react';
import { User } from 'firebase/auth';
import { Settings, Wallet, List, CheckCircle2, Shield, Globe, AlertTriangle, X, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  isDark: boolean;
  currentUser: User | null;
  userBalance: number;
  onOpenTopup: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ isDark, currentUser, userBalance, onOpenTopup, onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const creationDate = currentUser.metadata.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0f111a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
          <p className="text-slate-400">Welcome back, <span className="text-indigo-400 font-medium">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>!</p>
        </div>

        {/* Banners */}
        <div className="space-y-4">
          <div className="relative bg-[#1e2335] border border-indigo-500/20 rounded-2xl p-5 overflow-hidden">
            <button className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="absolute top-0 right-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-b-md">FREE</div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Gratis Pindah Server</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pindahkan akun VPN Anda ke server lain <span className="text-indigo-400 font-medium">sampai puas</span> tanpa biaya tambahan!
                </p>
                <div className="mt-3">
                  <h4 className="font-semibold text-slate-300 text-xs mb-1">Wilcard Support</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Semua layanan v2ray, xray, trojan, wireguard, dan lainnya sudah mendukung wilcard domain untuk list bisa lihat di sini <a href="#" className="text-indigo-400 hover:underline">Bug Wilcard</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-[#1e2335] border border-rose-500/20 rounded-2xl p-5 overflow-hidden">
            <button className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="absolute top-0 right-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-b-md">50% OFF</div>
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Promo Spesial</h3>
                <p className="text-xs text-slate-400">
                  Dapatkan <span className="text-rose-400 font-medium">diskon up to 50%</span> setiap tanggal kembar (11/11, 12/12, dll). Jangan lewatkan!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[#1e2335] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 border border-slate-700/50 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-inner">
            {currentUser.displayName ? currentUser.displayName[0] : currentUser.email ? currentUser.email[0] : 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-lg font-bold text-white">{currentUser.displayName || currentUser.email?.split('@')[0]}</h2>
            <p className="text-xs text-slate-400 mb-1">{currentUser.email}</p>
            <p className="text-[10px] text-slate-500">Member since {creationDate}</p>
          </div>
          <button 
            onClick={() => {}}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            User Settings
          </button>
        </div>

        {/* Balance & Transactions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 overflow-hidden shadow-lg shadow-emerald-500/20">
            <Wallet className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10" />
            <div className="relative z-10">
              <span className="text-emerald-50 text-xs font-semibold uppercase tracking-wider block mb-1">BALANCE</span>
              <div className="text-4xl font-black text-white tracking-tight mb-4">
                Rp. {userBalance.toLocaleString()}
              </div>
              <button 
                onClick={onOpenTopup}
                className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30  text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Top Up Balance
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-purple-600/20 flex flex-col justify-between">
            <div>
              <span className="text-purple-100 text-xs font-semibold uppercase tracking-wider block mb-1">TRANSACTION</span>
              <div className="text-2xl font-bold text-white mb-1">History</div>
              <p className="text-purple-200 text-xs">View all transactions</p>
            </div>
            <button className="w-full mt-4 py-3 rounded-xl bg-white/20 hover:bg-white/30  text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
              <List className="w-4 h-4" />
              View Transactions
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1e2335] rounded-2xl p-5 border border-slate-700/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Free Services</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
          </div>
          <div className="bg-[#1e2335] rounded-2xl p-5 border border-slate-700/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Premium Services</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
          </div>
          <div className="bg-[#1e2335] rounded-2xl p-5 border border-slate-700/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">DNS Records</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        {/* Active Services */}
        <div className="pt-4">
          <h3 className="text-lg font-bold text-white mb-4">Your Active Services</h3>
          <div className="bg-[#1e2335] rounded-2xl p-10 border border-slate-700/50 text-center flex flex-col items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-slate-500 mb-4" />
            <h4 className="text-white font-bold mb-2">No Services Found</h4>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">You haven't created any accounts yet.</p>
            <button 
              onClick={() => navigate('/free')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Create Your First Account
            </button>
          </div>
        </div>
        
        <div className="flex justify-center pt-8 pb-4">
          <button 
            onClick={onLogout}
            className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors px-6 py-2 rounded-full border border-rose-500/20 bg-rose-500/5"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};
