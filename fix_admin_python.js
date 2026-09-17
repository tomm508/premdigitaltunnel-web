import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  'PROJECT_ID="\\${PROJECT_ID}"',
  'PROJECT_ID="${firebaseConfig.projectId}"'
).replace(
  'API_KEY="\\${API_KEY}"',
  'API_KEY="${firebaseConfig.apiKey}"'
).replace(
  'SERVER_ID="\\${NODE_ID}"',
  'SERVER_ID="${selectedNodeId}"'
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched AdminPanel.tsx Python script variables");
