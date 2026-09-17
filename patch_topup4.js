import fs from 'fs';
let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminCode = adminCode.replace(
  /<img src=\{qrisUrl\} alt="QRIS Preview" className="w-full h-full object-contain rounded-lg" \/>/,
  '<img src={qrisUrl} alt="QRIS Preview" className="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer" />'
);
fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);

let topupCode = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');
topupCode = topupCode.replace(
  /<img src=\{displayQrisUrl\} alt="QRIS" className="w-full h-full object-contain" \/>/,
  '<img src={displayQrisUrl} alt="QRIS" className="w-full h-full object-contain" referrerPolicy="no-referrer" />'
);
fs.writeFileSync('src/components/TopupModal.tsx', topupCode);

console.log("Restored referrerPolicy.");
