import fs from 'fs';

let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminCode = adminCode.replace(/<img src=\{qrisUrl\.startsWith\('http'\)[^}]+\} alt="QRIS Preview"/g, '<img src={qrisUrl} alt="QRIS Preview"');
fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);

let topupCode = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');
topupCode = topupCode.replace(/<img src=\{displayQrisUrl\.startsWith\('http'\)[^}]+\} alt="QRIS"/g, '<img src={displayQrisUrl} alt="QRIS"');
fs.writeFileSync('src/components/TopupModal.tsx', topupCode);

console.log("Reverted proxy.");
