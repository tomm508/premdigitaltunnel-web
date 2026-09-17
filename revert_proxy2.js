import fs from 'fs';

let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminCode = adminCode.replace(
  /<img src=\{qrisUrl\.startsWith[^>]+>/,
  '<img src={qrisUrl} alt="QRIS Preview" className="w-full h-full object-contain rounded-lg" />'
);
fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);

let topupCode = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');
topupCode = topupCode.replace(
  /<img src=\{displayQrisUrl\.startsWith[^>]+>/,
  '<img src={displayQrisUrl} alt="QRIS" className="w-full h-full object-contain" />'
);
fs.writeFileSync('src/components/TopupModal.tsx', topupCode);

console.log("Reverted proxy 2.");
