import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Patch to dynamically count active servers from vpsNodes, not SERVERS_LIST length
code = code.replace(
  `        setActiveServers(typeof data.activeServers === 'number' ? data.activeServers : SERVERS_LIST.length);`,
  `        setActiveServers(typeof data.activeServers === 'number' ? data.activeServers : 0);`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
