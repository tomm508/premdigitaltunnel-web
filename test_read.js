import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const d = await getDoc(doc(db, 'platform', 'settings'));
    console.log("Read success! Exists:", d.exists());
  } catch (e) {
    console.error("Read failed:", e);
  }
  process.exit();
}
test();
