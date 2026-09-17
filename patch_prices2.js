import fs from 'fs';
let code = fs.readFileSync('src/components/SshCreateAccount.tsx', 'utf8');

code = code.replace(
    '<span className="text-[10px] text-slate-500 line-through">Rp 3.300</span>',
    '<span className="text-[10px] text-slate-500 line-through">Rp {planBasePrices.vip7.toLocaleString(\'id-ID\')}</span>'
);

code = code.replace(
    '<span className="text-[10px] text-slate-500 line-through">Rp 12.500</span>',
    '<span className="text-[10px] text-slate-500 line-through">Rp {planBasePrices.vip30.toLocaleString(\'id-ID\')}</span>'
);

fs.writeFileSync('src/components/SshCreateAccount.tsx', code);
console.log("Patched SshCreateAccount.tsx display labels");
