import React, { useState } from 'react';
import { X, LogIn, Shield, Check, Lock, Mail, User as UserIcon } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc } from '../lib/firebase';
import { User } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userBalance: number;
  onOpenTopup: () => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  currentUser,
  userBalance,
  onOpenTopup,
  onLogout
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Ensure user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Member',
          balance: 0,
          role: 'member',
          createdAt: new Date().toISOString()
        });
      }
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal login dengan Google');
      setIsProcessing(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGoogleSignIn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-md bg-[#161138] border border-purple-500/30 rounded-3xl shadow-2xl text-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#120d30]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {currentUser ? 'Akun Member PremDigital' : isLogin ? 'Member Login' : 'Create Member Account'}
              </h3>
              <p className="text-xs text-purple-300/80">
                {currentUser ? currentUser.email : 'Akses simpan tunnel, saldo top-up & server VIP'}
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

        {/* Body */}
        <div className="p-6">
          {currentUser ? (
            /* Logged in view */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Saldo Akun</span>
                  <div className="text-2xl font-black text-emerald-400">
                    Rp {userBalance.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenTopup();
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md cursor-pointer"
                >
                  + Top Up Saldo
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/10 flex justify-between">
                  <span className="text-slate-400">User ID</span>
                  <span className="font-mono text-slate-200">{currentUser.uid.slice(0, 10)}...</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/10 flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-purple-300">{currentUser.email}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenTopup();
                  }}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 cursor-pointer"
                >
                  Isi Saldo
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/30 border border-rose-500/30 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* 1-Click Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-900 bg-white hover:bg-slate-100 shadow-lg flex items-center justify-center gap-3 cursor-pointer transition-transform active:scale-98 disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z" />
                </svg>
                <span>{isProcessing ? 'Connecting...' : 'Masuk dengan Akun Google (1-Klik)'}</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-purple-500/20"></div>
                <span className="px-3 text-[11px] text-slate-400 uppercase">Atau Email Member</span>
                <div className="flex-1 border-t border-purple-500/20"></div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#120d2d] border border-purple-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login Member</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

