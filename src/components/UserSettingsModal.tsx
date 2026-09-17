import React, { useState, useEffect } from 'react';
import { User, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { X, User as UserIcon, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [displayName, setDisplayName] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateProfile(user, {
        displayName: displayName
      });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (currentPassword && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }
      
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('Please enter your current password to change it.');
      } else {
        setError(err.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#13172a] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">User Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50">
          <button
            onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'profile' 
                ? 'text-indigo-400 border-b-2 border-indigo-500' 
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserIcon className="w-4 h-4" /> Profile
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'password' 
                ? 'text-indigo-400 border-b-2 border-indigo-500' 
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email (Read Only)</label>
                <input 
                  type="email" 
                  value={user.email || ''} 
                  disabled
                  className="w-full bg-[#0b0e1b]/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[#0b0e1b] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required for security"
                  className="w-full bg-[#0b0e1b] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-[#0b0e1b] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Type new password again"
                  required
                  className="w-full bg-[#0b0e1b] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full py-3 mt-2 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Change Password</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
