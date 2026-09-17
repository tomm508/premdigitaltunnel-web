import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const proofUI = `
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-white">{topup.userEmail}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 uppercase">
                                {topup.paymentMethod}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Top Up: <strong className="text-emerald-400 text-sm">Rp {topup.amount.toLocaleString()}</strong>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {new Date(topup.createdAt).toLocaleString('id-ID')}
                            </p>
                            {topup.proofUrl && (
                              <div className="mt-3">
                                <p className="text-[10px] font-bold text-slate-400 mb-1">Bukti Transfer:</p>
                                <a href={topup.proofUrl} target="_blank" rel="noopener noreferrer">
                                  <div className="w-16 h-16 bg-black/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-indigo-500 transition-colors">
                                    <img src={topup.proofUrl} alt="Bukti Transfer" className="w-full h-full object-cover" />
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>`;

code = code.replace(
  /                          <div>\n                            <div className="flex items-center gap-2 mb-1">\n                              <span className="text-sm font-bold text-white">\{topup\.userEmail\}<\/span>\n                              <span className="px-2 py-0\.5 rounded text-\[10px\] font-bold bg-purple-500\/20 text-purple-300 uppercase">\n                                \{topup\.paymentMethod\}\n                              <\/span>\n                            <\/div>\n                            <p className="text-xs text-slate-400">\n                              Top Up: <strong className="text-emerald-400 text-sm">Rp \{topup\.amount\.toLocaleString\(\)\}<\/strong>\n                            <\/p>\n                            <p className="text-\[10px\] text-slate-500 mt-1">\n                              \{new Date\(topup\.createdAt\)\.toLocaleString\('id-ID'\)\}\n                            <\/p>\n                          <\/div>/g,
  proofUI
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched AdminPanel.tsx");
