import fs from 'fs';

let rules = fs.readFileSync('firestore.rules', 'utf8');

const oldTopup = `    match /topups/{topupId} {
      allow read: if isSignedIn() && (request.auth.uid == resource.data.uid || isAdmin());
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.uid;
      allow update: if isSignedIn() && (request.auth.uid == resource.data.uid || isAdmin());
      allow delete: if isAdmin();
    }`;

const newTopup = `    match /topups/{topupId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isAdmin();
    }`;

rules = rules.replace(oldTopup, newTopup);

fs.writeFileSync('firestore.rules', rules);
console.log("Patched firestore.rules again");
