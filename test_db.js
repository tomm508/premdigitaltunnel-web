import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    await setDoc(doc(db, 'platform', 'settings'), {
      test: true
    }, { merge: true });
    console.log("Write success!");
  } catch (e) {
    console.error("Write failed:", e);
  }
  process.exit();
}
test();
