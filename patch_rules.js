import fs from 'fs';

let rules = fs.readFileSync('firestore.rules', 'utf8');

const topupsRule = `
    match /topups/{topupId} {
      allow read: if isSignedIn() && (request.auth.uid == resource.data.uid || isAdmin());
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.uid;
      allow update: if isSignedIn() && (request.auth.uid == resource.data.uid || isAdmin());
      allow delete: if isAdmin();
    }
    
    match /users/{userId} {`;

rules = rules.replace(
  "    match /users/{userId} {",
  topupsRule
);

fs.writeFileSync('firestore.rules', rules);
console.log("Patched firestore.rules");
