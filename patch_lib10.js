import fs from 'fs';
let code = fs.readFileSync('src/components/FreeTunneling.tsx', 'utf8');

code = code.replace(
  `  const freeServers = liveServers.filter(s => 
    !s.isVip && s.supportedProtocols.includes(activeProtocol)
  );`,
  `  const freeServers = liveServers.filter(s => 
    !s.isVip && (s.supportedProtocols || []).includes(activeProtocol)
  );`
);

fs.writeFileSync('src/components/FreeTunneling.tsx', code);
