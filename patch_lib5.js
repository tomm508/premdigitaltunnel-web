import fs from 'fs';
let code = fs.readFileSync('src/lib/serverSync.ts', 'utf8');

code = code.replace(
  `lastHeartbeat: data.lastHeartbeat || '',`,
  `lastHeartbeat: data.lastHeartbeat?.toDate ? data.lastHeartbeat.toDate().toISOString() : data.lastHeartbeat || '',`
);

fs.writeFileSync('src/lib/serverSync.ts', code);
