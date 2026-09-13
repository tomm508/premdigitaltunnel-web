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
  // Check if any SG node is actively reporting heartbeat
  const activeSgNode = vpsNodes.find(
    n => (n.countryCode === 'SG' || n.id.toLowerCase().includes('sg') || n.name.toLowerCase().includes('sg')) 
      && isNodeHeartbeatActive(n.lastHeartbeat, n.status)
  );

  // Check if any ID node is actively reporting heartbeat
  const activeIdNode = vpsNodes.find(
    n => (n.countryCode === 'ID' || n.id.toLowerCase().includes('id') || n.name.toLowerCase().includes('id') || n.name.toLowerCase().includes('jakarta'))
      && isNodeHeartbeatActive(n.lastHeartbeat, n.status)
  );

  return SERVERS_LIST.map((srv) => {
    const isSG = srv.countryCode === 'SG' || srv.id.includes('sg') || srv.city.toLowerCase().includes('singapore');
    const isID = srv.countryCode === 'ID' || srv.id.includes('id') || srv.city.toLowerCase().includes('jakarta');

    if (isSG) {
      if (activeSgNode) {
        return {
          ...srv,
          ip: activeSgNode.ip || srv.ip,
          city: activeSgNode.city || srv.city,
          host: activeSgNode.name ? `${activeSgNode.name.toLowerCase().replace(/\s+/g, '')}.premdigital.web.id` : srv.host,
          load: activeSgNode.cpuLoad || srv.load,
          usedSlots: activeSgNode.onlineUsers || srv.usedSlots,
          status: 'Online',
          lastHeartbeat: activeSgNode.lastHeartbeat,
          cpuLoad: activeSgNode.cpuLoad,
          ramUsage: activeSgNode.ramUsage
        };
      } else {
        // No SG VPS reporting heartbeat
        return {
          ...srv,
          status: 'Down',
          load: 0,
          usedSlots: 0
        };
      }
    }

    if (isID) {
      if (activeIdNode) {
        return {
          ...srv,
          ip: activeIdNode.ip || srv.ip,
          city: activeIdNode.city || srv.city,
          host: activeIdNode.name ? `${activeIdNode.name.toLowerCase().replace(/\s+/g, '')}.premdigital.web.id` : srv.host,
          load: activeIdNode.cpuLoad || srv.load,
          usedSlots: activeIdNode.onlineUsers || srv.usedSlots,
          status: 'Online',
          lastHeartbeat: activeIdNode.lastHeartbeat,
          cpuLoad: activeIdNode.cpuLoad,
          ramUsage: activeIdNode.ramUsage
        };
      } else {
        // No ID VPS reporting heartbeat -> Down (Merah / Offline)
        return {
          ...srv,
          status: 'Down',
          load: 0,
          usedSlots: 0
        };
      }
    }

    // Default other servers
    return {
      ...srv,
      status: 'Down'
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
      const isOnline = isNodeHeartbeatActive(data.lastHeartbeat, data.status);
      rawNodes.push({
        id: doc.id,
        name: data.name || doc.id,
        ip: data.ip || '103.xxx.xxx.xxx',
        city: data.city,
        country: data.country,
        countryCode: data.countryCode,
        onlineUsers: Number(data.onlineUsers || 0),
        cpuLoad: Number(data.cpuLoad || 0),
        ramUsage: Number(data.ramUsage || 0),
        status: isOnline ? 'Online' : 'Down',
        lastHeartbeat: data.lastHeartbeat || '',
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
