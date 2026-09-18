import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

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

async function update() {
  try {
    const nodeRef = doc(db, 'vps_nodes', 'sg-premium-01');
    const snap = await getDoc(nodeRef);
    if (snap.exists()) {
      console.log("Current node data:", snap.data());
      await updateDoc(nodeRef, {
        domain: 'sg1.premdigital.web.id'
      });
      console.log("Updated sg-premium-01 with domain: sg1.premdigital.web.id");
    } else {
      console.log("Node sg-premium-01 not found");
    }
  } catch(e) {
    console.error("Error updating node:", e.message);
  }
  process.exit(0);
}
update();
