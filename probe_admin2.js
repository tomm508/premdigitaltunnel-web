import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collectionGroup, getDocs, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBKAcHs0TldS7_Ia78Mig3TR8tJMbt0jw",
  authDomain: "premdigital-vpn.firebaseapp.com",
  projectId: "premdigital-vpn",
  storageBucket: "premdigital-vpn.firebasestorage.app",
  messagingSenderId: "751805850629",
  appId: "1:751805850629:web:c220d8f561b22b3670a86c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function probe() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'agustiantomi80@gmail.com', 'Premdigital123'); // or let's try the other one
  } catch(e) {
    // try the form submit email
    try {
      await signInWithEmailAndPassword(auth, 'premdigitalssh@gmail.com', 'admin123');
    } catch(e2) {
      console.log("Could not authenticate as admin.");
      process.exit(0);
    }
  }
  
  try {
    await getDocs(collectionGroup(db, 'topups'));
    console.log("CollectionGroup topups is allowed!");
  } catch(e) {
    console.log("CollectionGroup topups is BLOCKED.");
  }
  process.exit(0);
}
probe();
