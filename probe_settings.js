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

async function check() {
  try {
    const snap = await getDoc(doc(db, 'platform', 'settings'));
    if (snap.exists()) {
      console.log("Settings data:", JSON.stringify(snap.data(), null, 2));
    } else {
      console.log("No settings doc found");
    }
  } catch(e) {
    console.error("Error reading settings:", e.message);
  }
  process.exit(0);
}
check();
