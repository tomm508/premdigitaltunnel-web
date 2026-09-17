import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBKAcHs0TldS7_Ia78Mig3TR8tJMbt0jw",
  projectId: "premdigital-vpn"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const ref = doc(db, 'platform', 'settings');
  const snap = await getDoc(ref);
  console.log(snap.data());
}
check();
