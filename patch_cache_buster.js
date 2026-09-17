import fs from 'fs';

let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminCode = adminCode.replace(
  /<img src=\{qrisUrl\} alt="QRIS Preview"/,
  '<img src={qrisUrl + (qrisUrl.includes("?") ? "&" : "?") + "cb=" + Date.now()} alt="QRIS Preview"'
);
fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);

let topupCode = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');
topupCode = topupCode.replace(
  /<img src=\{displayQrisUrl\} alt="QRIS"/,
  '<img src={displayQrisUrl + (displayQrisUrl.includes("?") ? "&" : "?") + "cb=" + Date.now()} alt="QRIS"'
);
fs.writeFileSync('src/components/TopupModal.tsx', topupCode);

console.log("Patched cache buster.");
