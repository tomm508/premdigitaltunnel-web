import fs from 'fs';

// Patch SshServerList.tsx
let listCode = fs.readFileSync('src/components/SshServerList.tsx', 'utf8');

// The previous block we injected was:
const oldListCode = `
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">3 Days</span>
                        <div className="flex items-center gap-2">
                           {pricing.discount > 0 && <span className="text-slate-500 line-through">Rp {Math.round((pricing.ssh / 30) * 3 / 100 * 100).toLocaleString('id-ID')}</span>}
                           <span className="text-emerald-400 font-bold">Rp {(Math.round((pricing.ssh / 30) * 3 / 100 * 100) * (1 - pricing.discount / 100)).toLocaleString('id-ID')}</span>
                           {pricing.discount > 0 && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>}
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">7 Days</span>
                        <div className="flex items-center gap-2">
                           {pricing.discount > 0 && <span className="text-slate-500 line-through">Rp {Math.round((pricing.ssh / 30) * 7 / 100 * 100).toLocaleString('id-ID')}</span>}
                           <span className="text-emerald-400 font-bold">Rp {(Math.round((pricing.ssh / 30) * 7 / 100 * 100) * (1 - pricing.discount / 100)).toLocaleString('id-ID')}</span>
                           {pricing.discount > 0 && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>}
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">30 Days</span>
                        <div className="flex items-center gap-2">
                           {pricing.discount > 0 && <span className="text-slate-500 line-through">Rp {pricing.ssh.toLocaleString('id-ID')}</span>}
                           <span className="text-emerald-400 font-bold">Rp {(pricing.ssh * (1 - pricing.discount / 100)).toLocaleString('id-ID')}</span>
                           {pricing.discount > 0 && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>}
                        </div>
                     </div>
                  </div>
`;

const newListCode = `
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">3 Days</span>
                        <div className="flex items-center gap-2">
                           {pricing.discount > 0 && <span className="text-slate-500 line-through">Rp 1.250</span>}
                           <span className="text-emerald-400 font-bold">Rp {(1250 * (1 - pricing.discount / 100)).toLocaleString('id-ID')}</span>
                           {pricing.discount > 0 && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>}
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">7 Days</span>
                        <div className="flex items-center gap-2">
                           {pricing.discount > 0 && <span className="text-slate-500 line-through">Rp 2.500</span>}
                           <span className="text-emerald-400 font-bold">Rp {(2500 * (1 - pricing.discount / 100)).toLocaleString('id-ID')}</span>
                           {pricing.discount > 0 && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>}
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-300 font-medium">30 Days</span>
                        <div className="flex items-center gap-2">
                           {pricing.discount > 0 && <span className="text-slate-500 line-through">Rp {pricing.ssh.toLocaleString('id-ID')}</span>}
                           <span className="text-emerald-400 font-bold">Rp {(pricing.ssh * (1 - pricing.discount / 100)).toLocaleString('id-ID')}</span>
                           {pricing.discount > 0 && <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">-{pricing.discount}%</span>}
                        </div>
                     </div>
                  </div>
`;

listCode = listCode.replace(oldListCode.trim(), newListCode.trim());
fs.writeFileSync('src/components/SshServerList.tsx', listCode);
console.log("Patched SshServerList.tsx");

// Patch SshCreateAccount.tsx
let createCode = fs.readFileSync('src/components/SshCreateAccount.tsx', 'utf8');

const oldPrices = `
  const planPrices = {
    free: 0,
    vip3: calculatePrice(Math.round((pricing.ssh / 30) * 3 / 100) * 100),
    vip7: calculatePrice(Math.round((pricing.ssh / 30) * 7 / 100) * 100),
    vip30: calculatePrice(pricing.ssh)
  };

  const planBasePrices = {
    free: 0,
    vip3: Math.round((pricing.ssh / 30) * 3 / 100) * 100,
    vip7: Math.round((pricing.ssh / 30) * 7 / 100) * 100,
    vip30: pricing.ssh
  };
`;

const newPrices = `
  const planPrices = {
    free: 0,
    vip3: calculatePrice(1250),
    vip7: calculatePrice(2500),
    vip30: calculatePrice(pricing.ssh)
  };

  const planBasePrices = {
    free: 0,
    vip3: 1250,
    vip7: 2500,
    vip30: pricing.ssh
  };
`;

createCode = createCode.replace(oldPrices.trim(), newPrices.trim());
fs.writeFileSync('src/components/SshCreateAccount.tsx', createCode);
console.log("Patched SshCreateAccount.tsx");

