import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, doc, onSnapshot, setDoc, updateDoc } from '../lib/firebase';
import { Settings, Users, Server, Clock, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminPanelProps {
  isDark: boolean;
  userRole: 'member' | 'admin';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isDark, userRole }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'services'>('settings');
  
  // Settings State
  const [priceSsh, setPriceSsh] = useState(1500);
  const [priceVmess, setPriceVmess] = useState(2500);
  const [priceVless, setPriceVless] = useState(2500);
  const [priceTrojan, setPriceTrojan] = useState(2500);
  const [freeLimit, setFreeLimit] = useState(50);
  const [resetTime, setResetTime] = useState('00:00');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPriceSsh(data.pricing?.ssh || 1500);
        setPriceVmess(data.pricing?.vmess || 2500);
        setPriceVless(data.pricing?.vless || 2500);
        setPriceTrojan(data.pricing?.trojan || 2500);
        setFreeLimit(data.freeAccountLimit || 50);
        setResetTime(data.resetTime || '00:00');
      }
    });
    return () => unsub();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await setDoc(doc(db, 'platform', 'settings'), {
        pricing: {
          ssh: Number(priceSsh),
          vmess: Number(priceVmess),
          vless: Number(priceVless),
          trojan: Number(priceTrojan),
        },
        freeAccountLimit: Number(freeLimit),
        resetTime: resetTime,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (userRole !== 'admin') return null;

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0f111a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-slate-400">Manage platform settings, pricing, and users.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <Settings className="w-4 h-4" />
              General Settings
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <Users className="w-4 h-4" />
              Users & Topups
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-[#1e2335] text-slate-400 hover:text-slate-200 hover:bg-[#252b42] border border-slate-700/50'}`}
            >
              <Server className="w-4 h-4" />
              Server Nodes
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#1e2335] border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">General & Pricing Configuration</h2>
                
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  
                  {/* Pricing Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Premium Pricing (Rp / 30 Days)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">SSH Premium</label>
                        <input type="number" value={priceSsh} onChange={(e) => setPriceSsh(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">V2Ray Vmess</label>
                        <input type="number" value={priceVmess} onChange={(e) => setPriceVmess(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">V2Ray Vless</label>
                        <input type="number" value={priceVless} onChange={(e) => setPriceVless(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Trojan</label>
                        <input type="number" value={priceTrojan} onChange={(e) => setPriceTrojan(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-700/50" />

                  {/* Free Account Rules */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Free Account Policies</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Daily Limit (Total Free Accounts)</label>
                        <input type="number" value={freeLimit} onChange={(e) => setFreeLimit(Number(e.target.value))} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Daily Reset Time (e.g. 00:00)</label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
                          <input type="time" value={resetTime} onChange={(e) => setResetTime(e.target.value)} className="w-full bg-[#13172a] border border-slate-600 rounded-xl pl-11 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">The VPS bash script can read these settings via API to automatically schedule resets.</p>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    {saveSuccess ? (
                      <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
                      </span>
                    ) : <span></span>}
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                </form>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <Users className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">User Management</h3>
                <p className="text-slate-400 text-sm max-w-sm">This module allows you to view registered users, edit their balances manually, and approve pending topups. Will be connected to Firestore collections.</p>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <Server className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Node Servers</h3>
                <p className="text-slate-400 text-sm max-w-sm">Manage VPS server IPs, Domain bindings, and monitor individual server CPU/RAM loads.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
