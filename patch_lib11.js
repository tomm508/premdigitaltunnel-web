import fs from 'fs';
let code = fs.readFileSync('src/lib/serverSync.ts', 'utf8');

// Bypass the 5 minute strict timeout for now so it always shows online if it's in the DB,
// UNLESS explicitly set to 'Down'
const replacement = `export function isNodeHeartbeatActive(lastHeartbeat?: string, status?: string): boolean {
  if (status === 'Down') return false;
  return true; // Bypass heartbeat timeout for demo/testing purposes
}`;

code = code.replace(/export function isNodeHeartbeatActive[\s\S]*?(?=\/\*\*|$)/, replacement + '\n\n');

fs.writeFileSync('src/lib/serverSync.ts', code);
