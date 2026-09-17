import fs from 'fs';
let code = fs.readFileSync('src/lib/serverSync.ts', 'utf8');

// Modify the VIP check to ensure we aren't accidentally filtering out normal servers
code = code.replace(
  `const isVip = node.id.toLowerCase().includes('vip') || node.id.toLowerCase().includes('premium');`,
  `const isVip = node.id.toLowerCase().includes('vip'); // Only treat explicitly named 'vip' nodes as VIP`
);

fs.writeFileSync('src/lib/serverSync.ts', code);
