import fs from 'fs';
let code = fs.readFileSync('src/components/SshServerList.tsx', 'utf8');

code = code.replace(
  `  const filteredServers = liveServers.filter(s => 
    (!isVipList ? !s.isVip : s.isVip) && s.supportedProtocols.includes(activeProtocol)
  );`,
  `  const filteredServers = liveServers.filter(s => 
    (!isVipList ? !s.isVip : s.isVip) && (s.supportedProtocols || []).includes(activeProtocol)
  );`
);

fs.writeFileSync('src/components/SshServerList.tsx', code);
