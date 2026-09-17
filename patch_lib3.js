import fs from 'fs';
let code = fs.readFileSync('src/lib/serverSync.ts', 'utf8');

const newFunc = `
export function resolveServersWithVpsStatus(vpsNodes: VpsNode[]): UnifiedServerNode[] {
  // Jika belum ada VPS yang terdaftar sama sekali di database, gunakan data dummy agar UI tidak kosong
  if (!vpsNodes || vpsNodes.length === 0) {
    return SERVERS_LIST.map(srv => ({
      ...srv,
      status: 'Online',
      load: Math.floor(Math.random() * 20) + 10,
    }));
  }

  // Jika ADA VPS yang terdaftar, kita BIKIN LIST SERVER berdasarkan VPS yang asli! (Dinamis)
  return vpsNodes.map(node => {
    const isOnline = isNodeHeartbeatActive(node.lastHeartbeat, node.status);
    
    // Helper untuk generate bendera dari kode negara
    const getFlag = (code?: string) => {
       if (!code) return '🌐';
       const c = code.toUpperCase();
       if (c === 'SG') return '🇸🇬';
       if (c === 'ID') return '🇮🇩';
       if (c === 'US') return '🇺🇸';
       if (c === 'MY') return '🇲🇾';
       try {
           const codePoints = c.split('').map(char => 127397 + char.charCodeAt(0));
           return String.fromCodePoint(...codePoints);
       } catch (e) {
           return '🌐';
       }
    };

    const cCode = (node.countryCode || 'SG').toUpperCase();
    const isVip = node.id.toLowerCase().includes('vip') || node.id.toLowerCase().includes('premium');
    
    return {
      id: node.id,
      country: node.country || (cCode === 'SG' ? 'Singapore' : cCode === 'ID' ? 'Indonesia' : 'Cloud Location'),
      countryCode: cCode,
      flag: getFlag(cCode),
      city: node.city || node.name || 'Cloud Server',
      host: node.name ? \`\${node.name.toLowerCase().replace(/\\s+/g, '')}.premdigital.web.id\` : \`server-\${node.id}.premdigital.web.id\`,
      ip: node.ip || '103.xxx.xxx.xxx',
      load: node.cpuLoad || 0,
      ping: isOnline ? (cCode === 'SG' ? 24 : 12) : 999, // Dummy ping for visual
      totalSlots: isVip ? 500 : 100, 
      usedSlots: node.onlineUsers || 0,
      supportedProtocols: ['ssh', 'vmess', 'vless', 'trojan'],
      isVip: isVip,
      limitCreated: isVip ? 500 : 100,
      leftCreated: (isVip ? 500 : 100) - (node.onlineUsers || 0),
      status: isOnline ? 'Online' : 'Down',
      lastHeartbeat: node.lastHeartbeat,
      cpuLoad: node.cpuLoad,
      ramUsage: node.ramUsage
    };
  });
}
`;

code = code.replace(/export function resolveServersWithVpsStatus[\s\S]*?(?=\/\*\*|$)/, newFunc);
fs.writeFileSync('src/lib/serverSync.ts', code);
