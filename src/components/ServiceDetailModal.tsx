import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  QrCode, 
  Terminal, 
  Shield, 
  Clock, 
  Server,
  Globe
} from 'lucide-react';
import { UserServiceAccount } from '../types';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserServiceAccount | null;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  isOpen,
  onClose,
  account
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!account || !isOpen) {
      setQrCodeUrl(null);
      setShowQr(false);
      return;
    }

    const textToQr = account.configString || account.server.domain || account.server.host;
    QRCode.toDataURL(textToQr, { width: 280, margin: 2 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    const filename = `PremDigital-${account.protocol}-${account.username}.txt`;
    const blob = new Blob([account.configString || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hostDomain = account.server.domain || account.server.host;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121624] border border-slate-700/70 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#161b2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Detail Akun {account.protocol.toUpperCase()}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  {account.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {account.server.country} ({account.server.city}) • User: {account.username}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-[#181d2f] border border-slate-800 rounded-xl p-3 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">HOST / DOMAIN</span>
              <span className="text-emerald-400 font-bold truncate block">{hostDomain}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">IP ADDRESS</span>
              <span className="text-white font-bold block">{account.server.ip}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-500 block text-[10px]">USERNAME</span>
              <span className="text-purple-300 font-bold block">{account.username}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-500 block text-[10px]">PASSWORD / UUID</span>
              <span className="text-purple-300 font-bold truncate block">{account.password || account.uuid || '-'}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 col-span-2">
              <span className="text-slate-500 block text-[10px]">EXPIRED AT</span>
              <span className="text-amber-400 font-bold block">{account.expiredAt}</span>
            </div>
          </div>

          {/* QR Code Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              {showQr ? 'Sembunyikan QR Code' : 'Tampilkan QR Code'}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download .txt
            </button>
          </div>

          {showQr && qrCodeUrl && (
            <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center max-w-[220px] mx-auto animate-in fade-in">
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              <span className="text-[11px] text-slate-800 font-mono font-bold mt-2">Scan di App V2Ray / HTTP Custom</span>
            </div>
          )}

          {/* Config Box */}
          {account.configString && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" /> Konfigurasi Lengkap:
                </span>
                <button
                  onClick={() => handleCopy(account.configString || '', 'cfg-all')}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedKey === 'cfg-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Salin Semua
                </button>
              </div>
              <pre className="bg-[#0f111a] border border-slate-700/70 rounded-xl p-3.5 text-xs text-slate-300 font-mono overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                {account.configString}
              </pre>
            </div>
          )}

          {/* Payload Box for SSH */}
          {account.payloadString && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
                <span className="font-semibold text-white">Payload WebSocket:</span>
                <button
                  onClick={() => handleCopy(account.payloadString || '', 'payload-all')}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedKey === 'payload-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Salin Payload
                </button>
              </div>
              <pre className="bg-[#0f111a] border border-slate-700/70 rounded-xl p-3 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
                {account.payloadString}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#161b2e] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
