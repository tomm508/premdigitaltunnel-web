import fs from 'fs';
let code = fs.readFileSync('src/components/FreeTunneling.tsx', 'utf8');

// The free server filter checks for (s.countryCode === 'SG' || s.countryCode === 'ID')
// But what if the user's VPS has a different country code? We should just remove the country code restriction for free servers for now, or just ensure it relies on !isVip.

code = code.replace(
  `  const freeServers = liveServers.filter(s => 
    !s.isVip && (s.countryCode === 'SG' || s.countryCode === 'ID') && s.supportedProtocols.includes(activeProtocol)
  );`,
  `  const freeServers = liveServers.filter(s => 
    !s.isVip && s.supportedProtocols.includes(activeProtocol)
  );`
);

fs.writeFileSync('src/components/FreeTunneling.tsx', code);
