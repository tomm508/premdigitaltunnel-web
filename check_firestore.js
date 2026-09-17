import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Trying to read credentials if available, otherwise just use mock data check
// Wait, in this environment, do we have firebase-admin credentials?
console.log("Checking environment variables...");
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS ? "Has creds" : "No creds");
