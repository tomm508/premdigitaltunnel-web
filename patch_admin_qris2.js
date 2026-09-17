import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const t4 = `                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Security & Verification</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Cloudflare Turnstile Site Key (Leave empty to disable)</label>
                        <input type="text" value={turnstileSiteKey} onChange={(e) => setTurnstileSiteKey(e.target.value)} placeholder="0x4AAAAAA..." className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Enable Cloudflare Turnstile CAPTCHA on account creation to prevent bots/spam. Get your Site Key from Cloudflare dashboard.</p>
                  </div>

                  <div className="pt-4 flex items-center justify-between">`;

const r4 = `                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Security & Verification</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Cloudflare Turnstile Site Key (Leave empty to disable)</label>
                        <input type="text" value={turnstileSiteKey} onChange={(e) => setTurnstileSiteKey(e.target.value)} placeholder="0x4AAAAAA..." className="w-full bg-[#13172a] border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Enable Cloudflare Turnstile CAPTCHA on account creation to prevent bots/spam. Get your Site Key from Cloudflare dashboard.</p>
                  </div>
                  
                  <hr className="border-slate-700/50" />
                  
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

                  <div className="pt-4 flex items-center justify-between">`;

if (code.includes('Enable Cloudflare Turnstile CAPTCHA')) {
  code = code.replace(t4, r4);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log("Patched AdminPanel.tsx to include QRIS URL input UI");
} else {
  console.log("Could not find the target code to replace.");
}
