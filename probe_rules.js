import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';

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
  const userCredential = await signInWithEmailAndPassword(auth, 'testdummy99@example.com', 'password123');
  const user = userCredential.user;
  
  console.log("Probing users/uid/topups...");
  try {
    await addDoc(collection(db, 'users', user.uid, 'topups'), { test: 1 });
    console.log("users/uid/topups is WRITABLE!");
  } catch(e) {
    console.log("users/uid/topups is BLOCKED.");
  }
  
  console.log("Probing users/uid/accounts...");
  try {
    await addDoc(collection(db, 'users', user.uid, 'accounts'), { test: 1 });
    console.log("users/uid/accounts is WRITABLE!");
  } catch(e) {
    console.log("users/uid/accounts is BLOCKED.");
  }

  process.exit(0);
}

probe();
