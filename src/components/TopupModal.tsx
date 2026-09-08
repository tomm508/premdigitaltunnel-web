import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  History, 
  QrCode, 
  Check, 
  AlertCircle,
  Copy,
  Clock,
  CreditCard
} from 'lucide-react';
import { User } from 'firebase/auth';
import { db, doc, setDoc, addDoc, collection } from '../lib/firebase';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  balance: number;
  onSuccessDeposit: (amount: number) => void;
}

export const TopupModal: React.FC<TopupModalProps> = ({
  isOpen,
  onClose,
  user,
  balance,
  onSuccessDeposit
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'dana' | 'gopay'>('qris');
  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const amounts = [5000, 10000, 20000, 50000, 100000];

  const currentDepositAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  const handleCreateDeposit = async () => {
    if (currentDepositAmount < 1000) return;
    setIsProcessing(true);

    try {
      if (user) {
        // Save pending topup in Firestore
        await addDoc(collection(db, 'users', user.uid, 'topups'), {
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }

      setTimeout(() => {
        setIsProcessing(false);
        setStep('pay');
      }, 600);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStep('pay');
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      if (user) {
        const newBalance = balance + currentDepositAmount;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Member',
          balance: newBalance,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        onSuccessDeposit(currentDepositAmount);
      }
      setIsProcessing(false);
      setStep('success');
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStep('success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#161138] border border-purple-500/30 rounded-3xl shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#120d30]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-400/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Top Up Saldo Member
              </h3>
              <p className="text-xs text-purple-300/80">
                Saldo Anda saat ini: <span className="font-bold text-emerald-400">Rp {balance.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Pilih Nominal Top Up
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                          : 'bg-purple-950/40 border-purple-500/20 text-slate-300 hover:bg-purple-900/40'
                      }`}
                    >
                      Rp {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Atau Masukkan Nominal Lain (IDR)
                </label>
                <input
                  type="number"
                  placeholder="Min Rp 1.000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white text-sm outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-pink-300" />
                    QRIS Realtime
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dana')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentMethod === 'dana'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                    DANA / OVO
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gopay')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      paymentMethod === 'gopay'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    GoPay / Shopee
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing || currentDepositAmount < 1000}
                  onClick={handleCreateDeposit}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Lanjut Bayar Rp {currentDepositAmount.toLocaleString()}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'pay' && (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/20">
                <span className="text-xs text-slate-400">Total Pembayaran</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  Rp {currentDepositAmount.toLocaleString()}
                </div>
              </div>

              {/* QR Code / Pay instructions */}
              <div className="p-6 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                <div className="w-44 h-44 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white text-center">
                  <QrCode className="w-24 h-24 text-purple-400 mb-1" />
                  <span className="text-[11px] font-bold text-purple-200">QRIS STANDAR</span>
                  <span className="text-[9px] text-slate-400">premdigital.web.id</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/20 text-xs text-slate-300 flex items-center justify-between">
                <span>Ref Tagihan: #{Math.floor(100000 + Math.random() * 900000)}</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Menunggu Bayar
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSimulatePaymentSuccess}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Sudah Bayar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-purple-950/40 text-slate-300 hover:bg-purple-900/50"
                >
                  Ubah
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Top Up Berhasil!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Saldo senilai <strong className="text-emerald-400">Rp {currentDepositAmount.toLocaleString()}</strong> telah ditambahkan ke akun Firebase Anda.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
                Saldo Baru: <strong className="text-emerald-400 font-mono">Rp {(balance).toLocaleString()}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('select');
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 cursor-pointer"
              >
                Selesai & Gunakan Saldo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
