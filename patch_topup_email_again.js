import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

const target = `    try {
      if (user) {
        // Save pending topup in Firestore
        await addDoc(collection(db, 'users', user.uid, 'topups'), {
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }

      setTimeout(() => {`;

const replacement = `    try {
      if (user) {
        // Save pending topup in Firestore
        await addDoc(collection(db, 'users', user.uid, 'topups'), {
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        
        // Trigger email alert directly to Admin
        fetch('https://formsubmit.co/ajax/premdigitalssh@gmail.com', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: \`🚨 Top Up Masuk: Rp \${currentDepositAmount} dari \${user.email || 'Member'}\`,
            Email_Member: user.email,
            Nominal: 'Rp ' + currentDepositAmount,
            Metode_Pembayaran: paymentMethod,
            Status: 'Menunggu Verifikasi Admin',
            Pesan: 'Silakan login ke Admin Panel untuk memverifikasi pembayaran ini.'
          })
        }).catch(err => console.log('Email alert error:', err));
      }

      setTimeout(() => {`;

if (code.includes('await addDoc(collection(db, \'users\', user.uid, \'topups\')')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/TopupModal.tsx', code);
  console.log('Patched TopupModal.tsx with email notification');
} else {
  console.log('Target code not found');
}
