import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

const target = `        // Save pending topup in Firestore (Root collection for admin to easily view)
        const ref = await addDoc(collection(db, 'topups'), {
          uid: user.uid,
          userEmail: user.email || 'Unknown',
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString()
        });`;

const replacement = `        // Save pending topup in Firestore (Root collection for admin to easily view)
        const ref = await addDoc(collection(db, 'topups'), {
          uid: user.uid,
          userEmail: user.email || 'Unknown',
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        
        // Also add a system notification document that we can trigger an email off of later
        // or just use Formspree/EmailJS to send directly to your email
        fetch('https://formspree.io/f/xdoqjvew', { // Note: We will replace this with a proper email service if you prefer, but for now we write to a 'notifications' collection
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            message: 'Ada request Top Up baru senilai Rp ' + currentDepositAmount,
            amount: currentDepositAmount
          })
        }).catch(err => console.log('Formspree silent error'));`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log('Patched topup modal with email notification hook');
