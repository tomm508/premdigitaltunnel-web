import fs from 'fs';
let code = fs.readFileSync('src/components/AccountModal.tsx', 'utf8');

// Replace the buggy useEffect block for random username filling
const target = `  // Auto-fill random username
  useEffect(() => {
    if (isOpen) {
      if (initialServer) {
        setSelectedServer(initialServer);
      } else {
        setSelectedServer(SERVERS_LIST[0]);
      }`;

const replacement = `  // Auto-fill random username
  useEffect(() => {
    if (isOpen) {
      if (initialServer) {
        setSelectedServer(initialServer);
      } else if (liveServers && liveServers.length > 0) {
        // Find first online server, else fallback to first server in list
        const firstOnline = liveServers.find(s => s.status === 'Online');
        setSelectedServer(firstOnline || liveServers[0]);
      } else {
        setSelectedServer(SERVERS_LIST[0]);
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AccountModal.tsx', code);
