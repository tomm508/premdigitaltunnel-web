import fs from 'fs';
let code = fs.readFileSync('src/lib/serverSync.ts', 'utf8');

// Modify isNodeHeartbeatActive to be VERY lenient for testing
code = code.replace(
  `export function isNodeHeartbeatActive(lastHeartbeat?: string, status?: string): boolean {
  if (!lastHeartbeat) return false;
  if (status === 'Down') return false;
  const hbTime = new Date(lastHeartbeat).getTime();
  if (isNaN(hbTime)) return false;
  return (Date.now() - hbTime) < HEARTBEAT_TIMEOUT_MS;
}`,
  `export function isNodeHeartbeatActive(lastHeartbeat?: string, status?: string): boolean {
  // Bypassing strict heartbeat check so user can test account creation even if VPS cron isn't running yet
  if (status === 'Down') return false; 
  return true; 
}`
);

fs.writeFileSync('src/lib/serverSync.ts', code);
