import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
`        setUserRole(currentUser.email === 'agustiantomi80@gmail.com' ? 'admin' : (data.role ?? 'member'));`,
`        const userIsAdmin = currentUser.email?.toLowerCase() === 'agustiantomi80@gmail.com';
        setUserRole(userIsAdmin ? 'admin' : (data.role ?? 'member'));
        if (userIsAdmin && data.role !== 'admin') {
          updateDoc(doc(db, 'users', currentUser.uid), { role: 'admin' }).catch(() => {});
        }`
);
fs.writeFileSync('src/App.tsx', code);
