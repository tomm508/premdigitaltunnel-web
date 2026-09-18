import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBKAcHs0TldS7_Ia78Mig3TR8tJMbt0jw",
  authDomain: "premdigital-vpn.firebaseapp.com",
  projectId: "premdigital-vpn",
  storageBucket: "premdigital-vpn.firebasestorage.app",
  messagingSenderId: "751805850629",
  appId: "1:751805850629:web:c220d8f561b22b3670a86c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  try {
    console.log("Attempting to read platform/settings without auth...");
    const docRef = doc(db, 'platform', 'settings');
    const snap = await getDoc(docRef);
    console.log("Success! Data:", snap.data());
    process.exit(0);
  } catch (e) {
    console.error("Test failed with error:", e);
    process.exit(1);
  }
}

runTest();
