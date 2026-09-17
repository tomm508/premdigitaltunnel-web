import fs from 'fs';
let code = fs.readFileSync('src/lib/serverSync.ts', 'utf8');

const originalStrict = `export function isNodeHeartbeatActive(lastHeartbeat?: string, status?: string): boolean {
  if (!lastHeartbeat) return false;
  if (status === 'Down') return false;
  const hbTime = new Date(lastHeartbeat).getTime();
  if (isNaN(hbTime)) return false;
  return (Date.now() - hbTime) < HEARTBEAT_TIMEOUT_MS;
}`;

code = code.replace(/export function isNodeHeartbeatActive[\s\S]*?(?=\/\*\*|$)/, originalStrict + '\n\n');

fs.writeFileSync('src/lib/serverSync.ts', code);
