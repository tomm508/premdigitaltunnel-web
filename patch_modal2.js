import fs from 'fs';
let code = fs.readFileSync('src/components/AccountModal.tsx', 'utf8');

const newBlock = `      const cmdRef = await addDoc(collection(db, 'vps_commands'), {
        serverId: selectedServer.id,
        action: 'CREATE_ACCOUNT',
        protocol,
        username: username.trim(),
        password,
        uuid,
        activeDays: expiryDays,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Listen for status change from the VPS daemon
      const unsubscribe = onSnapshot(cmdRef, (snap) => {
        const data = snap.data();
        if (data && data.status === 'success') {
          unsubscribe();
          setGeneratedAccount(account);
          onAccountCreated(account);
          setIsGenerating(false);
        } else if (data && data.status === 'error') {
          unsubscribe();
          setIsGenerating(false);
          setErrorMsg(data.message || 'VPS failed to create account.');
        }
      });

      // Timeout fallback if VPS is offline
      setTimeout(() => {
        unsubscribe();
        if (isGenerating) {
           setIsGenerating(false);
           setErrorMsg('Timeout: VPS daemon tidak merespon. Pastikan script auto-creator berjalan di VPS.');
        }
      }, 30000);`;

const oldBlock = `      // Bypass actual VPS daemon listener for demo
      setTimeout(() => {
          setGeneratedAccount(account);
          onAccountCreated(account);
          setIsGenerating(false);
      }, 1500);`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/AccountModal.tsx', code);
