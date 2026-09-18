import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

async function runTest() {
  try {
    // Attempt to login as member
    console.log("Logging in...");
    const userCredential = await signInWithEmailAndPassword(auth, 'agustiantomi80@gmail.com', 'admin123'); // Assuming admin, or any valid user
    console.log("Logged in as:", userCredential.user.email);
    
    console.log("Attempting to write to topups collection...");
    const docRef = await addDoc(collection(db, 'topups'), {
      amount: 10000,
      paymentMethod: "QRIS",
      status: "pending",
      uid: userCredential.user.uid,
      userEmail: userCredential.user.email,
      createdAt: new Date().toISOString()
    });
    console.log("Success! Document written with ID: ", docRef.id);
    process.exit(0);
  } catch (e) {
    console.error("Test failed with error:", e);
    process.exit(1);
  }
}

runTest();
