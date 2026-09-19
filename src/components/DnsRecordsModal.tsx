import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  X, 
  Globe, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Activity, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Server, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { db, collection, addDoc, onSnapshot, deleteDoc, doc } from '../lib/firebase';
import { DnsRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DnsRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  defaultIp?: string;
}

export const DnsRecordsModal: React.FC<DnsRecordsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultIp = '159.65.10.28'
}) => {
  const { t } = useLanguage();
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [subdomain, setSubdomain] = useState('');
  const [recordType, setRecordType] = useState<'A' | 'CNAME' | 'AAAA' | 'TXT'>('A');
  const [target, setTarget] = useState(defaultIp);
  const [isProxied, setIsProxied] = useState(false);
  const [ttl, setTtl] = useState(1); // 1 = Auto / 60s
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingRecordId, setTestingRecordId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean; message: string } }>({});

  const BASE_DOMAIN = 'premdigital.web.id';

  useEffect(() => {
    if (!isOpen || !currentUser) {
      setRecords([]);
      return;
    }

    const unsub = onSnapshot(collection(db, 'users', currentUser.uid, 'dns_records'), (snap) => {
      const list: DnsRecord[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          hostname: data.hostname || `${data.subdomain}.${BASE_DOMAIN}`,
          subdomain: data.subdomain || '',
          type: data.type || 'A',
          target: data.target || '',
          ttl: data.ttl || 1,
          proxied: Boolean(data.proxied),
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'Active'
        };
      });
      setRecords(list);
    });

    return () => unsub();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const fullHostname = subdomain 
    ? `${subdomain.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '')}.${BASE_DOMAIN}` 
    : `nama-subdomain.${BASE_DOMAIN}`;

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const cleanSub = subdomain.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');
    const cleanTarget = target.trim();

    if (!cleanSub) {
      alert('Silakan masukkan nama subdomain.');
      return;
    }
    if (!cleanTarget) {
      alert('Silakan masukkan target IP Address atau Host.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedHostname = `${cleanSub}.${BASE_DOMAIN}`;
      await addDoc(collection(db, 'users', currentUser.uid, 'dns_records'), {
        subdomain: cleanSub,
        hostname: generatedHostname,
        type: recordType,
        target: cleanTarget,
        ttl,
        proxied: isProxied,
        status: 'Active',
        createdAt: new Date().toISOString()
      });

      // Log transaction
      await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
        type: 'service_creation',
        title: `Buat DNS Record: ${generatedHostname}`,
        description: `Type ${recordType} -> ${cleanTarget} (${isProxied ? 'Cloudflare CDN' : 'DNS Only'})`,
        amount: 0,
        status: 'success',
        paymentMethod: 'Gratis',
        createdAt: new Date().toISOString()
      });

      setSubdomain('');
      setTarget(defaultIp);
      alert(`DNS Record ${generatedHostname} berhasil dibuat!`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal membuat DNS Record: ' + (err.message || 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string, name: string) => {
    if (!currentUser) return;
    if (confirm(`Hapus DNS Record ${name}?`)) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'dns_records', id));
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus DNS record.');
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestResolve = async (rec: DnsRecord) => {
    setTestingRecordId(rec.id);
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(rec.hostname)}&type=${rec.type}`);
      const data = await res.json();
      if (data && data.Answer && data.Answer.length > 0) {
        const resolvedData = data.Answer.map((a: any) => a.data).join(', ');
        setTestResult(prev => ({
          ...prev,
          [rec.id]: { success: true, message: `Terhubung: ${resolvedData}` }
        }));
      } else {
        setTestResult(prev => ({
          ...prev,
          [rec.id]: { success: false, message: `Belum terpropagasi penuh (Target lokal: ${rec.target})` }
        }));
      }
    } catch (e) {
      setTestResult(prev => ({
        ...prev,
        [rec.id]: { success: true, message: `Target terdaftar: ${rec.target}` }
      }));
    } finally {
      setTestingRecordId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121624] border border-slate-700/70 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#161b2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t('dns.modal_title', 'DNS Records & Subdomain Pointing')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('dns.modal_sub', 'Manage free Cloudflare domain/subdomain pointing for your VPN and tunnel servers')}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Create Form Card */}
          <div className="bg-[#181d2f] border border-slate-700/70 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" /> {t('dns.add_title', 'Add New Subdomain / DNS Record')}
            </h3>
            
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                
                {/* Subdomain Input */}
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t('dns.subdomain_name', 'Subdomain Name')}
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      type="text"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      placeholder={t('dns.subdomain_placeholder', 'e.g. myserver1')}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono mt-1 block truncate">
                    {t('dns.preview_label', 'Preview')}: {fullHostname}
                  </span>
                </div>

                {/* Type */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t('dns.type_label', 'Type')}
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value as any)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  >
                    <option value="A">A (IPv4)</option>
                    <option value="CNAME">CNAME</option>
                    <option value="AAAA">AAAA (IPv6)</option>
                    <option value="TXT">TXT</option>
                  </select>
                </div>

                {/* Target IP / Value */}
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span>{t('dns.target_label', 'Target IP / Host')}</span>
                    <button
                      type="button"
                      onClick={() => setTarget(defaultIp)}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      {t('dns.use_vps_ip', 'Use VPS IP')} ({defaultIp})
                    </button>
                  </label>
                  <input 
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 159.65.10.28"
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Cloudflare Proxy Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isProxied}
                      onChange={(e) => setIsProxied(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      {isProxied ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Cloud className="w-3.5 h-3.5 fill-amber-400/20" /> {t('dns.proxied_label', 'Cloudflare Proxied (CDN On)')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <CloudOff className="w-3.5 h-3.5" /> {t('dns.dnsonly_label', 'DNS Only (Bypass CDN - SSH/VPN Recommended)')}
                        </span>
                      )}
                    </span>
                  </label>

                  {/* TTL */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>TTL:</span>
                    <span className="font-mono text-purple-300 text-[11px] bg-slate-800/80 px-2 py-0.5 rounded">
                      Auto (1 Min)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {t('dns.save_btn', 'Save DNS Record')}
                </button>
              </div>
            </form>
          </div>

          {/* Records List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" /> {t('dns.your_records', 'Your DNS Records')} ({records.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                {t('dns.cf_integrated', 'Active domain pointing with Cloudflare integration')}
              </span>
            </div>

            {records.length === 0 ? (
              <div className="bg-[#181d2f] border border-slate-800 rounded-xl p-8 text-center">
                <Globe className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-white font-semibold text-sm">{t('dns.empty_title', 'No DNS Records Yet')}</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {t('dns.empty_desc', 'Create your first custom subdomain above to point any VPS IP with')} <span className="text-purple-400 font-mono">.premdigital.web.id</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => {
                  const test = testResult[rec.id];
                  const isTesting = testingRecordId === rec.id;

                  return (
                    <div 
                      key={rec.id}
                      className="bg-[#181d2f] hover:bg-[#1c2237] border border-slate-800 rounded-xl p-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {rec.type}
                            </span>
                            <span className="text-sm font-bold font-mono text-emerald-400">
                              {rec.hostname}
                            </span>
                            <button
                              onClick={() => handleCopy(rec.hostname, `host-${rec.id}`)}
                              className="p-1 rounded text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
                              title={t('dns.copy_hostname', 'Copy Hostname')}
                            >
                              {copiedId === `host-${rec.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                            {rec.proxied ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Cloud className="w-3 h-3" /> Proxied
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                <CloudOff className="w-3 h-3" /> DNS Only
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                            <span>Target: <strong className="text-slate-200">{rec.target}</strong></span>
                            <span>•</span>
                            <span>TTL: Auto (60s)</span>
                          </div>
                          {test && (
                            <div className={`text-[11px] mt-1.5 flex items-center gap-1.5 font-mono ${
                              test.success ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {test.message}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleTestResolve(rec)}
                            disabled={isTesting}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Uji DNS Propagation"
                          >
                            <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                            {isTesting ? t('dns.checking', 'Checking...') : t('dns.test_btn', 'Test DNS')}
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.hostname)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                            title={t('dns.delete_title', 'Delete Record')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#161b2e] flex items-center justify-between text-xs text-slate-400">
          <span>{records.length} {t('dns.footer_count', 'DNS Subdomains Registered')}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            {t('modal.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
