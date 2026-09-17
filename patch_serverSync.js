import fs from 'fs';
let code = fs.readFileSync('src/lib/serverSync.ts', 'utf8');

const badCode = `
    snap.forEach((doc) => {
      const data = doc.data();
      const isOnline = isNodeHeartbeatActive(data.lastHeartbeat, data.status);
      rawNodes.push({
`;

const goodCode = `
    snap.forEach((doc) => {
      const data = doc.data();
      const hbStr = data.lastHeartbeat?.toDate ? data.lastHeartbeat.toDate().toISOString() : data.lastHeartbeat || '';
      const isOnline = isNodeHeartbeatActive(hbStr, data.status);
      rawNodes.push({
`;

code = code.replace(badCode.trim(), goodCode.trim());
fs.writeFileSync('src/lib/serverSync.ts', code);
console.log("Patched serverSync.ts heartbeat bug");
