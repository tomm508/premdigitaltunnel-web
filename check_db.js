import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  projectId: "premdigital-db"
});
const db = getFirestore(app);
async function run() {
  const docRef = doc(db, 'platform', 'settings');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Settings:", docSnap.data().qrisUrl);
  } else {
    console.log("No settings");
  }
}
run();
