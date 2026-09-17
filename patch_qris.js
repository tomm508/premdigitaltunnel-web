import fs from 'fs';

let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

const target = `                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={\`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer \${
                      paymentMethod === 'qris'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                    }\`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-pink-300" />
                    QRIS Realtime
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dana')}
                    className={\`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer \${
                      paymentMethod === 'dana'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                    }\`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                    DANA / OVO
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gopay')}
                    className={\`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer \${
                      paymentMethod === 'gopay'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                    }\`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    GoPay / Shopee
                  </button>
                </div>`;

const replacement = `                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={\`p-3 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 \${
                      paymentMethod === 'qris'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-950/40 border-purple-500/20 text-slate-300'
                    }\`}
                  >
                    <QrCode className="w-6 h-6 text-pink-300" />
                    QRIS All Payment
                  </button>
                </div>`;

if (code.includes('grid-cols-3')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/TopupModal.tsx', code);
  console.log("Patched TopupModal.tsx to only show QRIS");
} else {
  console.log("Could not find the target code.");
}
