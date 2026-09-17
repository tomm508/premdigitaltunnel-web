import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyCBKAcHs0TldS7_Ia78Mig3TR8tJMbt0jw",
  authDomain: "premdigital-vpn.firebaseapp.com",
  projectId: "premdigital-vpn",
  storageBucket: "premdigital-vpn.firebasestorage.app",
  messagingSenderId: "751805850629",
  appId: "1:751805850629:web:c220d8f561b22b3670a86c"
});
const db = getFirestore(app);

async function run() {
  const docRef = doc(db, 'platform', 'settings');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Settings:", docSnap.data());
  } else {
    console.log("No settings");
  }
}
run();
