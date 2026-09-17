import fs from 'fs';

function applyProxy(code, targetVar) {
  return code.replace(
    new RegExp(`<img src=\\{${targetVar}\\}`, 'g'),
    `<img src={${targetVar}.startsWith('http') ? \`https://wsrv.nl/?url=\${encodeURIComponent(${targetVar}.replace(/^https?:\\/\\//, ''))}\` : ${targetVar}}`
  );
}

let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminCode = applyProxy(adminCode, 'qrisUrl');
fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);

let topupCode = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');
topupCode = applyProxy(topupCode, 'displayQrisUrl');
fs.writeFileSync('src/components/TopupModal.tsx', topupCode);

console.log("Patched proxy on QRIS images.");
