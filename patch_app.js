import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Patch App.tsx to avoid using SERVERS_LIST length for active servers
code = code.replace(
  `activeServers: liveNodesActiveCount !== null ? liveNodesActiveCount : (typeof data.activeServers === 'number' ? data.activeServers : prev.activeServers || SERVERS_LIST.length),`,
  `activeServers: liveNodesActiveCount !== null ? liveNodesActiveCount : (typeof data.activeServers === 'number' ? data.activeServers : prev.activeServers || 0),`
);

fs.writeFileSync('src/App.tsx', code);
