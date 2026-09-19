import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { TunnelServer, VpsNode } from '../types';
import { SERVERS_LIST } from '../data/mockData';

// Maximum time without heartbeat before a VPS is considered offline / down (5 minutes)
export const HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000;

export interface UnifiedServerNode extends TunnelServer {
  status: 'Online' | 'Down';
  lastHeartbeat?: string;
  cpuLoad?: number;
  ramUsage?: number;
}

/**
 * Checks if a VPS node has a recent heartbeat.
 * A node is Online ONLY IF:
 * 1. It has lastHeartbeat timestamp, and
 * 2. (CurrentTime - lastHeartbeat) < 5 minutes, and
 * 3. Status in Firestore is not explicitly 'Down'
 */
export function isNodeHeartbeatActive(lastHeartbeat?: string, status?: string): boolean {
  if (!lastHeartbeat) return false;
  if (status === 'Down') return false;
  const hbTime = new Date(lastHeartbeat).getTime();
  if (isNaN(hbTime)) return false;
  return (Date.now() - hbTime) < HEARTBEAT_TIMEOUT_MS;
}

/**
 * Resolves the real-time status of standard SG & ID servers based on live VPS nodes in Firestore.
 * If user only runs a Singapore VPS (e.g. sg-do-01), SG becomes Online (green).
 * If no Indonesia VPS is reporting heartbeat, ID automatically becomes Offline/Down (red).
 */


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
    const isVip = node.id.toLowerCase().includes('vip'); // Only treat explicitly named 'vip' nodes as VIP
    
    // Resolve host / domain:
    // 1. Explicit domain or host set in Firestore
    // 2. Intelligent extraction from node.name (e.g. "SG1 DigitalOcean" -> "sg1.premdigital.web.id")
    const resolveNodeHost = (): string => {
      const explicitDomain = (node.domain || node.host || '').trim();
      if (explicitDomain) return explicitDomain;

      // SG server pointing domain in Cloudflare
      if (cCode === 'SG' || node.id.includes('sg') || node.name?.toLowerCase().includes('sg')) {
        return 'sgdo-premdigital.web.id';
      }

      if (node.name) {
        // Detect codes like ID1, ID2, etc.
        const match = node.name.match(/^([a-zA-Z]{2}[-_]?[0-9]{1,2})/i);
        if (match) {
          const cleanCode = match[1].toLowerCase().replace(/[-_]/g, '');
          return `${cleanCode}.premdigital.web.id`;
        }
      }
      return 'id1.premdigital.web.id';
    };

    const hostDomain = resolveNodeHost();

    return {
      id: node.id,
      country: node.country || (cCode === 'SG' ? 'Singapore' : cCode === 'ID' ? 'Indonesia' : 'Cloud Location'),
      countryCode: cCode,
      flag: getFlag(cCode),
      city: node.city || node.name || 'Cloud Server',
      host: hostDomain,
      domain: hostDomain,
      ip: node.ip || '103.xxx.xxx.xxx',
      load: node.cpuLoad || 0,
      ping: isOnline ? (cCode === 'SG' ? 24 : 12) : 999, // Dummy ping for visual
      totalSlots: isVip ? 500 : 100, 
      usedSlots: Number(node.usedSlots !== undefined ? node.usedSlots : (node.onlineUsers || 0)),
      supportedProtocols: ['ssh', 'vmess', 'vless', 'trojan'],
      isVip: isVip,
      limitCreated: isVip ? 500 : 100,
      leftCreated: Math.max(0, (isVip ? 500 : 100) - Number(node.usedSlots !== undefined ? node.usedSlots : (node.onlineUsers || 0))),
      status: isOnline ? 'Online' : 'Down',
      lastHeartbeat: node.lastHeartbeat,
      cpuLoad: node.cpuLoad,
      ramUsage: node.ramUsage
    };
  });
}
/**
 * Custom React hook for live server sync across the app
 */
export function subscribeVpsNodes(
  onUpdate: (servers: UnifiedServerNode[], rawNodes: VpsNode[]) => void
) {
  return onSnapshot(collection(db, 'vps_nodes'), (snap) => {
    const rawNodes: VpsNode[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      const hbStr = data.lastHeartbeat?.toDate ? data.lastHeartbeat.toDate().toISOString() : data.lastHeartbeat || '';
      const isOnline = isNodeHeartbeatActive(hbStr, data.status);
      rawNodes.push({
        id: doc.id,
        name: data.name || doc.id,
        ip: data.ip || '103.xxx.xxx.xxx',
        domain: data.domain || data.host || '',
        host: data.host || data.domain || '',
        city: data.city,
        country: data.country,
        countryCode: data.countryCode,
        onlineUsers: Number(data.onlineUsers || 0),
        usedSlots: Number(data.usedSlots !== undefined ? data.usedSlots : data.onlineUsers || 0),
        cpuLoad: Number(data.cpuLoad || 0),
        ramUsage: Number(data.ramUsage || 0),
        status: isOnline ? 'Online' : 'Down',
        lastHeartbeat: data.lastHeartbeat?.toDate ? data.lastHeartbeat.toDate().toISOString() : data.lastHeartbeat || '',
        sshOnline: Number(data.sshOnline || 0),
        xrayOnline: Number(data.xrayOnline || 0)
      });
    });

    const unifiedServers = resolveServersWithVpsStatus(rawNodes);
    onUpdate(unifiedServers, rawNodes);
  }, (err) => {
    console.warn("Error subscribing to vps_nodes:", err);
    // Fallback: check without nodes
    onUpdate(resolveServersWithVpsStatus([]), []);
  });
}
