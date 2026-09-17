import fs from 'fs';

let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

// Replace addDoc part
code = code.replace(
  /await addDoc\(collection\(db, 'users', user\.uid, 'topups'\), \{[\s\S]*?\}\);/m,
  `const docRef = await addDoc(collection(db, 'topups'), {
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          uid: user.uid,
          userEmail: user.email,
          createdAt: new Date().toISOString()
        });
        setCurrentTopupId(docRef.id);`
);

fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log("Patched TopupModal.tsx");
