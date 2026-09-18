import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  X, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  CreditCard,
  Calendar,
  Filter,
  ExternalLink,
  Shield
} from 'lucide-react';
import { db, collection, onSnapshot, query, orderBy } from '../lib/firebase';
import { TransactionItem } from '../types';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenTopup: () => void;
  userBalance: number;
}

export const TransactionsModal: React.FC<TransactionsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenTopup,
  userBalance
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'topup' | 'services' | 'migration'>('all');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !currentUser) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);

    // 1. Listen to Topup requests
    const topupUnsub = onSnapshot(collection(db, 'users', currentUser.uid, 'topups'), (topupSnap) => {
      const topupList: TransactionItem[] = topupSnap.docs.map((d) => {
        const data = d.data();
        let status: 'success' | 'pending' | 'rejected' = 'pending';
        if (data.status === 'success') status = 'success';
        else if (data.status === 'rejected' || data.status === 'failed') status = 'rejected';

        return {
          id: d.id,
          type: 'topup',
          title: `Deposit Saldo (${data.paymentMethod ? data.paymentMethod.toUpperCase() : 'QRIS'})`,
          description: `Top up saldo akun via ${data.paymentMethod || 'QRIS / E-Wallet'}`,
          amount: Number(data.amount) || 0,
          status,
          paymentMethod: data.paymentMethod || 'QRIS',
          createdAt: data.createdAt || new Date().toISOString()
        };
      });

      // 2. Listen to user transactions (Services & Migrations)
      const transUnsub = onSnapshot(collection(db, 'users', currentUser.uid, 'transactions'), (transSnap) => {
        const transList: TransactionItem[] = transSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: data.type || 'service_creation',
            title: data.title || 'Layanan VPN',
            description: data.description || '',
            amount: Number(data.amount) || 0,
            status: data.status || 'success',
            paymentMethod: data.paymentMethod || 'Saldo Akun',
            createdAt: data.createdAt || new Date().toISOString(),
            protocol: data.protocol,
            serverName: data.serverName
          };
        });

        // 3. Listen to user accounts to backfill if transactions collection was empty
        const accountsUnsub = onSnapshot(collection(db, 'users', currentUser.uid, 'accounts'), (accSnap) => {
          const existingTransIds = new Set(transList.map(t => t.id));
          const accTransList: TransactionItem[] = [];

          accSnap.docs.forEach((d) => {
            const accData = d.data();
            const accTransId = `acc-${d.id}`;
            if (!existingTransIds.has(accTransId)) {
              accTransList.push({
                id: accTransId,
                type: 'service_creation',
                title: `Buat Akun ${(accData.protocol || 'SSH').toUpperCase()}`,
                description: `${accData.server?.country || 'Server'} (${accData.server?.city || 'Default'}) - User: ${accData.username}`,
                amount: accData.type === 'premium' ? 10000 : 0,
                status: 'success',
                paymentMethod: accData.type === 'premium' ? 'Saldo Akun' : 'Gratis',
                createdAt: accData.createdAt || new Date().toISOString(),
                protocol: accData.protocol
              });
            }
          });

          const combined = [...topupList, ...transList, ...accTransList].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setTransactions(combined);
          setIsLoading(false);
        });

        return () => accountsUnsub();
      });

      return () => transUnsub();
    });

    return () => topupUnsub();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'topup') return item.type === 'topup';
    if (activeTab === 'services') return item.type === 'service_creation';
    if (activeTab === 'migration') return item.type === 'server_migration';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Berhasil
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 animate-spin" /> Verifikasi
          </span>
        );
      case 'rejected':
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121624] border border-slate-700/70 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#161b2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Riwayat Transaksi
              </h2>
              <p className="text-xs text-slate-400">
                Catatan deposit saldo, pembelian layanan, dan pindah server
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Saldo Akun Anda</span>
            <div className="text-xl font-bold text-white">
              Rp {userBalance.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenTopup();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            Top Up Saldo
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 bg-[#121624] flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'topup'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Deposit ({transactions.filter(t => t.type === 'topup').length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'services'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Layanan VPN ({transactions.filter(t => t.type === 'service_creation').length})
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'migration'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Pindah Server ({transactions.filter(t => t.type === 'server_migration').length})
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mb-3" />
              <p className="text-sm">Memuat riwayat transaksi...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-600 mb-3">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Belum Ada Transaksi</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                {activeTab === 'topup' 
                  ? 'Anda belum pernah melakukan deposit saldo.'
                  : activeTab === 'migration'
                  ? 'Anda belum pernah melakukan pemindahan server.'
                  : 'Belum ada riwayat aktivitas pada kategori ini.'}
              </p>
              {activeTab === 'topup' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTopup();
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Deposit Saldo Sekarang
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const dateStr = new Date(tx.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isTopup = tx.type === 'topup';
              const isMigration = tx.type === 'server_migration';

              return (
                <div 
                  key={tx.id}
                  className="bg-[#181d2f] hover:bg-[#1c2237] border border-slate-800 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isTopup 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : isMigration
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {isTopup ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : isMigration ? (
                        <RefreshCw className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{tx.title}</h4>
                        {getStatusBadge(tx.status)}
                      </div>
                      {tx.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{tx.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {dateStr}
                        </span>
                        {tx.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> {tx.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className="text-[11px] text-slate-500 sm:hidden">Nominal:</span>
                    <span className={`text-sm font-extrabold font-mono ${
                      isTopup 
                        ? 'text-emerald-400' 
                        : isMigration || tx.amount === 0
                        ? 'text-indigo-400'
                        : 'text-purple-300'
                    }`}>
                      {isTopup ? `+Rp ${tx.amount.toLocaleString()}` : tx.amount > 0 ? `-Rp ${tx.amount.toLocaleString()}` : 'GRATIS (Rp 0)'}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:block">
                      ID: {tx.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#161b2e] flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredTransactions.length} transaksi</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
