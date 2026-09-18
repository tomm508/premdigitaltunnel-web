import fs from 'fs';

// 1. Fix TopupModal.tsx
let topupCode = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

topupCode = topupCode.replace(
  /collection\(db, 'topups'\)/g,
  "collection(db, 'users', user.uid, 'topups')"
);

topupCode = topupCode.replace(
  /doc\(db, 'topups', currentTopupId\)/g,
  "doc(db, 'users', user.uid, 'topups', currentTopupId)"
);

// In case the file already has `users', user.uid, 'topups'` from my previous attempt (fix_topup_no_rules.js)
// I will just use regex to make sure it's correct.

fs.writeFileSync('src/components/TopupModal.tsx', topupCode);

// 2. Fix AdminPanel.tsx
let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldAdminTopups = `  // Fetch pending topups
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'topups'), (snapshot) => {
      const topups = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((t: any) => t.status === 'waiting_verification')
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingTopups(topups);
    });
    return () => unsub();
  }, []);`;

const newAdminTopups = `  // Fetch pending topups polling
  const fetchPendingTopups = async () => {
    try {
      const { getDocs } = await import('firebase/firestore');
      const usersSnap = await getDocs(collection(db, 'users'));
      let allTopups: any[] = [];
      for (const uDoc of usersSnap.docs) {
        const topupsSnap = await getDocs(collection(db, 'users', uDoc.id, 'topups'));
        topupsSnap.docs.forEach((tDoc: any) => {
          const t = { id: tDoc.id, ...tDoc.data(), userDocId: uDoc.id };
          if (t.status === 'waiting_verification') {
            allTopups.push(t);
          }
        });
      }
      allTopups.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingTopups(allTopups);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingTopups();
    const interval = setInterval(fetchPendingTopups, 15000);
    return () => clearInterval(interval);
  }, []);`;

adminCode = adminCode.replace(oldAdminTopups, newAdminTopups);

const oldApprove = `      // 3. Mark topup as success
      await setDoc(doc(db, 'topups', topup.id), {
        status: 'success',
        updatedAt: new Date().toISOString()
      }, { merge: true });`;

const newApprove = `      // 3. Mark topup as success
      await setDoc(doc(db, 'users', topup.userDocId, 'topups', topup.id), {
        status: 'success',
        updatedAt: new Date().toISOString()
      }, { merge: true });`;

adminCode = adminCode.replace(oldApprove, newApprove);

const oldReject = `  const handleRejectTopup = async (topupId: string) => {
    if (confirm('Anda yakin ingin menolak Top Up ini?')) {
      try {
        await setDoc(doc(db, 'topups', topupId), {
          status: 'rejected',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error(err);
      }
    }
  };`;

const newReject = `  const handleRejectTopup = async (topup: any) => {
    if (confirm('Anda yakin ingin menolak Top Up ini?')) {
      try {
        await setDoc(doc(db, 'users', topup.userDocId, 'topups', topup.id), {
          status: 'rejected',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        fetchPendingTopups();
      } catch (err) {
        console.error(err);
      }
    }
  };`;

adminCode = adminCode.replace(oldReject, newReject);

// Also need to update the reject button onClick in AdminPanel to pass the whole topup object
adminCode = adminCode.replace(
  `onClick={() => handleRejectTopup(topup.id)}`,
  `onClick={() => handleRejectTopup(topup)}`
);

// Call fetchPendingTopups after approve
adminCode = adminCode.replace(
  `alert('Top Up sebesar Rp ' + topup.amount.toLocaleString() + ' berhasil disetujui.');`,
  `alert('Top Up sebesar Rp ' + topup.amount.toLocaleString() + ' berhasil disetujui.');
      fetchPendingTopups();`
);

fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);
console.log("Patched AdminPanel.tsx completely!");
