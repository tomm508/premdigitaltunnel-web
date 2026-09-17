import fs from 'fs';
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
code = code.replace("getFirestore,", "getFirestore, initializeFirestore,");
code = code.replace(
  "export const db = getFirestore(app);",
  "export const db = initializeFirestore(app, { experimentalForceLongPolling: true });"
);
fs.writeFileSync('src/lib/firebase.ts', code);
console.log("Patched Firestore initialization.");
