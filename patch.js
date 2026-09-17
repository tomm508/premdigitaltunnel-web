const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
`    const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserBalance(data.balance ?? 0);
        setUserRole(currentUser.email === 'agustiantomi80@gmail.com' ? 'admin' : (data.role ?? 'member'));
      }
    }, (err) => {`,
`    const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserBalance(data.balance ?? 0);
        setUserRole(currentUser.email === 'agustiantomi80@gmail.com' ? 'admin' : (data.role ?? 'member'));
      } else {
        setUserBalance(0);
        setUserRole(currentUser.email === 'agustiantomi80@gmail.com' ? 'admin' : 'member');
        
        // Also auto-create the user doc if it's missing (especially for first time login after migration)
        setDoc(doc(db, 'users', currentUser.uid), {
          email: currentUser.email,
          balance: 0,
          role: currentUser.email === 'agustiantomi80@gmail.com' ? 'admin' : 'member',
          createdAt: new Date().toISOString()
        }).catch(err => console.log('Error creating user doc:', err));
      }
    }, (err) => {`
);
fs.writeFileSync('src/App.tsx', code);
