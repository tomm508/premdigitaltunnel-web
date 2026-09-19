import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Settings, 
  Wallet, 
  List, 
  CheckCircle2, 
  Shield, 
  Globe, 
  AlertTriangle, 
  X, 
  Tag, 
  Repeat, 
  Terminal, 
  Copy, 
  Check, 
  Trash2, 
  QrCode, 
  Download, 
  Plus, 
  ExternalLink,
  ArrowRight,
  Clock,
  Zap,
  Server
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserSettingsModal } from './UserSettingsModal';
import { TransactionsModal } from './TransactionsModal';
import { DnsRecordsModal } from './DnsRecordsModal';
import { MigrateServerModal } from './MigrateServerModal';
import { ServiceDetailModal } from './ServiceDetailModal';
import { db, doc, onSnapshot, collection, deleteDoc } from '../lib/firebase';
import { UserServiceAccount, TunnelServer } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DashboardProps {
  isDark: boolean;
  currentUser: User | null;
  userBalance: number;
  onOpenTopup: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  isDark, 
  currentUser, 
  userBalance, 
  onOpenTopup, 
  onLogout 
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [discount, setDiscount] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isDnsOpen, setIsDnsOpen] = useState(false);
  const [accounts, setAccounts] = useState<UserServiceAccount[]>([]);
  const [dnsRecordsCount, setDnsRecordsCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [migratingAccount, setMigratingAccount] = useState<UserServiceAccount | null>(null);
  const [inspectingAccount, setInspectingAccount] = useState<UserServiceAccount | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Listen to platform discount settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDiscount(data.pricing?.discount ?? 50);
      }
    });
    return () => unsub();
  }, []);

  // Listen to user's real accounts & DNS records from Firestore
  useEffect(() => {
    if (!currentUser) return;

    // 1. User accounts
    const unsubAccounts = onSnapshot(collection(db, 'users', currentUser.uid, 'accounts'), (snap) => {
      const list: UserServiceAccount[] = snap.docs.map((d) => {
        const data = d.data();
        const fallbackServer: TunnelServer = {
          id: 'sg-premium-01',
          country: 'Singapore',
          countryCode: 'SG',
          flag: '🇸🇬',
          city: 'Singapore',
          host: 'sgdo-premdigital.web.id',
          domain: 'sgdo-premdigital.web.id',
          ip: '159.65.10.28',
          load: 28,
          ping: 15,
          totalSlots: 100,
          usedSlots: 10,
          supportedProtocols: ['ssh', 'vmess', 'vless', 'trojan']
        };

        const activeDays = Number(data.activeDays) || 3;
        const sType = data.type || (activeDays > 7 ? 'premium' : 'free');

        return {
          id: d.id,
          protocol: data.protocol || 'ssh',
          username: data.username || '',
          password: data.password || '',
          uuid: data.uuid || '',
          server: data.server || fallbackServer,
          activeDays,
          expiredAt: data.expiredAt || new Date(Date.now() + activeDays * 86400000).toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
          type: sType,
          status: data.status || 'active',
          configString: data.configString || '',
          payloadString: data.payloadString || '',
          rawConfig: data.rawConfig || ''
        };
      });

      setAccounts(list);
    });

    // 2. DNS records count
    const unsubDns = onSnapshot(collection(db, 'users', currentUser.uid, 'dns_records'), (snap) => {
      setDnsRecordsCount(snap.docs.length);
    });

    return () => {
      unsubAccounts();
      unsubDns();
    };
  }, [currentUser]);

  if (!currentUser) return null;

  const creationDate = currentUser.metadata.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recently';

  const freeServicesCount = accounts.filter(a => a.type === 'free' || a.activeDays <= 7).length;
  const premiumServicesCount = accounts.filter(a => a.type === 'premium' || a.activeDays > 7).length;

  const filteredAccounts = accounts.filter(a => {
    if (activeFilter === 'free') return a.type === 'free' || a.activeDays <= 7;
    if (activeFilter === 'premium') return a.type === 'premium' || a.activeDays > 7;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteService = async (account: UserServiceAccount) => {
    if (!currentUser) return;
    if (confirm(`Hapus layanan ${account.protocol.toUpperCase()} (${account.username}) dari daftar aktif Anda?`)) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'accounts', account.id));
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus layanan.');
      }
    }
  };

  const handleDownloadFile = (acc: UserServiceAccount) => {
    const filename = `PremDigital-${acc.protocol}-${acc.username}.txt`;
    const blob = new Blob([acc.configString || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDaysLeft = (expDateStr: string) => {
    const now = new Date().getTime();
    const exp = new Date(expDateStr).getTime();
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0f111a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Welcome back, <span className="text-indigo-400 font-medium">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>!
          </p>
        </div>

        {/* Banners */}
        <div className="space-y-4">
          {showBanner && (
            <div className="relative bg-[#1e2335] border border-indigo-500/20 rounded-2xl p-5 overflow-hidden shadow-lg shadow-indigo-950/20">
              <button 
                onClick={() => setShowBanner(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-0 right-10 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-b-md">
                {t('dash.free_feature', 'FREE FEATURE')}
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Repeat className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    {t('dash.migrate_feature', 'Free Server Migration')}
                    <span className="text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Unlimited
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t('dash.migrate_banner', 'Switch your VPN account to any server anytime with zero extra fees! Your username, password, and active days remain preserved.')}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const el = document.getElementById('active-services-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {t('dash.view_active', 'View Active Services')} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => setIsDnsOpen(true)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {t('dash.manage_dns', 'Manage DNS Records')} <Globe className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {discount > 0 && (
            <div className="relative bg-[#1e2335] border border-rose-500/20 rounded-2xl p-5 overflow-hidden shadow-lg shadow-rose-950/20">
              <div className="absolute top-0 right-10 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-b-md">
                {discount}% OFF
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{t('dash.special_promo', 'Special Promotion')}</h3>
                  <p className="text-xs text-slate-400">
                    {t('dash.discount_info', `Enjoy up to ${discount}% discount on all premium service purchases! Balance is ready to use anytime.`)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-[#1e2335] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 border border-slate-700/50 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-inner shrink-0">
            {currentUser.displayName ? currentUser.displayName[0] : currentUser.email ? currentUser.email[0] : 'U'}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{currentUser.displayName || currentUser.email?.split('@')[0]}</h2>
            <p className="text-xs text-slate-400 mb-1 truncate">{currentUser.email}</p>
            <p className="text-[10px] text-slate-500">{t('dash.member_since', 'Member since')} {creationDate}</p>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            {t('dash.user_settings', 'User Settings')}
          </button>
        </div>

        {/* Balance & Transactions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Balance Card */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-2xl p-6 overflow-hidden shadow-lg shadow-emerald-600/20 flex flex-col justify-between">
            <Wallet className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10" />
            <div className="relative z-10">
              <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider block mb-1">
                {t('dash.balance_card', 'ACCOUNT BALANCE')}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Rp {userBalance.toLocaleString()}
              </div>
            </div>
            <button 
              onClick={onOpenTopup}
              className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm relative z-10"
            >
              <Wallet className="w-4 h-4" />
              {t('dash.topup_btn', 'Top Up Balance')}
            </button>
          </div>

          {/* Transactions Card */}
          <div 
            onClick={() => setIsTransactionsOpen(true)}
            className="group cursor-pointer bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 rounded-2xl p-6 shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden transition-transform hover:-translate-y-0.5"
          >
            <List className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:opacity-15 transition-opacity" />
            <div className="relative z-10">
              <span className="text-purple-100 text-xs font-semibold uppercase tracking-wider block mb-1">
                {t('dash.transactions_title', 'TRANSACTIONS')}
              </span>
              <div className="text-2xl font-bold text-white mb-1">{t('dash.history_title', 'History & Activity')}</div>
              <p className="text-purple-200 text-xs">{t('dash.history_desc', 'View all deposit and account purchase records')}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsTransactionsOpen(true);
              }}
              className="w-full mt-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm relative z-10"
            >
              <List className="w-4 h-4" />
              {t('dash.view_tx', 'View Transactions')}
            </button>
          </div>
        </div>

        {/* Stats Grid: Free Services, Premium Services, DNS Records */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Free Services */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'free' ? 'all' : 'free')}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeFilter === 'free'
                ? 'bg-[#1e2335] border-slate-500 shadow-md ring-2 ring-slate-400/40'
                : 'bg-[#1e2335] border-slate-700/50 hover:border-slate-600'
            } flex items-center gap-4`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1.5">
                Free Services
                {activeFilter === 'free' && <span className="text-[10px] text-slate-300 font-bold">(Filter)</span>}
              </p>
              <p className="text-2xl font-bold text-white">{freeServicesCount}</p>
            </div>
          </div>

          {/* Premium Services */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'premium' ? 'all' : 'premium')}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeFilter === 'premium'
                ? 'bg-[#1e2335] border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                : 'bg-[#1e2335] border-slate-700/50 hover:border-emerald-500/40'
            } flex items-center gap-4`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1.5">
                Premium Services
                {activeFilter === 'premium' && <span className="text-[10px] text-emerald-400 font-bold">(Filter)</span>}
              </p>
              <p className="text-2xl font-bold text-emerald-400">{premiumServicesCount}</p>
            </div>
          </div>

          {/* DNS Records */}
          <div 
            onClick={() => setIsDnsOpen(true)}
            className="cursor-pointer bg-[#1e2335] rounded-2xl p-5 border border-slate-700/50 hover:border-purple-500/50 transition-all flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">DNS Records</p>
                <p className="text-2xl font-bold text-purple-400">{dnsRecordsCount}</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
              {t('dash.manage', 'Manage')} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Active Services Section */}
        <div id="active-services-section" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {t('dash.my_services', 'Your Active Services')} ({accounts.length})
              </h3>
              <p className="text-xs text-slate-400">
                {t('dash.my_services_sub', 'Manage configs, copy credentials, or switch servers instantly')}
              </p>
            </div>

            {/* Filter Tabs */}
            {accounts.length > 0 && (
              <div className="flex items-center gap-2 bg-[#1e2335] p-1 rounded-xl border border-slate-700/50 text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('dash.filter_all', 'All')} ({accounts.length})
                </button>
                <button
                  onClick={() => setActiveFilter('free')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeFilter === 'free'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('dash.filter_free', 'Free')} ({freeServicesCount})
                </button>
                <button
                  onClick={() => setActiveFilter('premium')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeFilter === 'premium'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('dash.filter_premium', 'Premium')} ({premiumServicesCount})
                </button>
              </div>
            )}
          </div>

          {/* Accounts List */}
          {accounts.length === 0 ? (
            <div className="bg-[#1e2335] rounded-2xl p-10 border border-slate-700/50 text-center flex flex-col items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-slate-500 mb-4" />
              <h4 className="text-white font-bold mb-2">{t('dash.no_services_title', 'No Services Found')}</h4>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">
                {t('dash.no_services_desc', "You haven't created any accounts yet. Create a free SSH, VMess, VLESS, or Trojan account now!")}
              </p>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                {t('dash.create_first', 'Create Your First Account')}
              </button>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="bg-[#1e2335] rounded-2xl p-8 border border-slate-700/50 text-center">
              <p className="text-slate-400 text-sm">{t('dash.no_filtered_services', 'No services found in this filter category.')}</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-3 text-xs text-purple-400 hover:underline cursor-pointer"
              >
                {t('dash.show_all_services', 'Show All Services')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map((acc) => {
                const daysLeft = getDaysLeft(acc.expiredAt);
                const isExpired = daysLeft === 0;
                const hostDomain = acc.server.domain || acc.server.host;

                return (
                  <div
                    key={acc.id}
                    className="bg-[#1e2335] hover:bg-[#22283d] border border-slate-700/60 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left Details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {acc.server.flag || '🌐'}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                            {acc.protocol}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            acc.type === 'premium'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {acc.type}
                          </span>
                          <h4 className="text-sm font-bold text-white truncate">
                            {acc.server.country} ({acc.server.city})
                          </h4>
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {t('dash.active_status', 'Active')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                          <span>User: <strong className="text-white font-semibold">{acc.username}</strong></span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]" title={hostDomain}>
                            Host: <strong className="text-emerald-400">{hostDomain}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {isExpired ? (
                              <span className="text-rose-400 font-bold">{t('dash.expired', 'Expired')}</span>
                            ) : (
                              <>{t('dash.days_left_prefix', 'Remaining')}: <strong className="text-amber-400">{daysLeft} {t('dash.days', 'Days')}</strong> (Exp: {new Date(acc.expiredAt).toLocaleDateString()})</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 flex-wrap self-end md:self-center shrink-0">
                      
                      {/* Pindah Server Button */}
                      <button
                        onClick={() => setMigratingAccount(acc)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                        title={t('dash.btn_migrate', 'Migrate Server')}
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        {t('dash.btn_migrate', 'Migrate Server')}
                      </button>

                      {/* Detail / Config Button */}
                      <button
                        onClick={() => setInspectingAccount(acc)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={t('dash.btn_detail', 'Detail Config')}
                      >
                        <Terminal className="w-3.5 h-3.5 text-purple-400" />
                        {t('dash.btn_detail', 'Detail Config')}
                      </button>

                      {/* Download txt */}
                      <button
                        onClick={() => handleDownloadFile(acc)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                        title="Download Config (.txt)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteService(acc)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                        title={t('dash.btn_delete', 'Delete Service')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Sign Out Button */}
        <div className="flex justify-center pt-8 pb-4">
          <button 
            onClick={onLogout}
            className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors px-6 py-2 rounded-full border border-rose-500/20 bg-rose-500/5 cursor-pointer"
          >
            Sign Out
          </button>
        </div>

      </div>
      
      {/* User Settings Modal */}
      <UserSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={currentUser} 
      />

      {/* Transactions History Modal */}
      <TransactionsModal
        isOpen={isTransactionsOpen}
        onClose={() => setIsTransactionsOpen(false)}
        currentUser={currentUser}
        onOpenTopup={onOpenTopup}
        userBalance={userBalance}
      />

      {/* DNS Records & Subdomain Pointing Modal */}
      <DnsRecordsModal
        isOpen={isDnsOpen}
        onClose={() => setIsDnsOpen(false)}
        currentUser={currentUser}
        defaultIp="159.65.10.28"
      />

      {/* Migrate Server (Pindah Server) Modal */}
      <MigrateServerModal
        isOpen={Boolean(migratingAccount)}
        onClose={() => setMigratingAccount(null)}
        account={migratingAccount}
        currentUser={currentUser}
        onMigrationSuccess={(updated) => {
          setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
        }}
      />

      {/* Service Detail & QR Modal */}
      <ServiceDetailModal
        isOpen={Boolean(inspectingAccount)}
        onClose={() => setInspectingAccount(null)}
        account={inspectingAccount}
      />
    </div>
  );
};
