import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const t1 = `  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');`;
const r1 = `  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [qrisUrl, setQrisUrl] = useState('');`;

const t2 = `        setTurnstileSiteKey(data.turnstileSiteKey || '');`;
const r2 = `        setTurnstileSiteKey(data.turnstileSiteKey || '');
        setQrisUrl(data.qrisUrl || '');`;

const t3 = `        turnstileSiteKey: turnstileSiteKey,`;
const r3 = `        turnstileSiteKey: turnstileSiteKey,
        qrisUrl: qrisUrl,`;

const t4 = `                  <hr className="border-slate-700/50" />

                  <div className="flex items-center justify-end">`;

const r4 = `                  <hr className="border-slate-700/50" />
                  
                  {/* Payment Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Payment Configuration (QRIS)</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">QRIS Image URL</label>
                        <input type="text" placeholder="https://example.com/qris.jpg" value={qrisUrl} onChange={(e) => setQrisUrl(e.target.value)} className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                        <p className="text-[10px] text-slate-500 mt-1">Masukkan link gambar QRIS Anda (format jpg/png). Ini akan ditampilkan kepada member saat top up.</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-700/50" />

                  <div className="flex items-center justify-end">`;


code = code.replace(t1, r1).replace(t2, r2).replace(t3, r3).replace(t4, r4);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched AdminPanel.tsx to include QRIS URL input");
