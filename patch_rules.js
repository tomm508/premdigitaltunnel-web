import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');

const target = `    match /vps_commands/{commandId} {      allow read, write: if true;    }`;
const replacement = `    match /vps_commands/{commandId} {      allow read, write: if true;    }    match /topups/{topupId} {      allow read, write: if true;    }`;

rules = rules.replace(target, replacement);
fs.writeFileSync('firestore.rules', rules);
console.log("Patched firestore.rules");
