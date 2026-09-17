import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

const target = `fetch('https://formspree.io/f/xdoqjvew', { // Note: We will replace this with a proper email service if you prefer, but for now we write to a 'notifications' collection
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            message: 'Ada request Top Up baru senilai Rp ' + currentDepositAmount,
            amount: currentDepositAmount
          })
        }).catch(err => console.log('Formspree silent error'));`;

const replacement = `// Trigger email alert directly to Admin
        fetch('https://formsubmit.co/ajax/agustiantomi80@gmail.com', {
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
        }).catch(err => console.log('Email alert error:', err));`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log('Patched topup modal with formsubmit email hook');
