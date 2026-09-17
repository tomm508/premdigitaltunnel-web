import fs from 'fs';
let code = fs.readFileSync('src/components/SshCreateAccount.tsx', 'utf8');

const newBlock = `      // Add command to VPS queue for auto-creation
      try {
        const cmdRef = await addDoc(collection(db, 'vps_commands'), {
          serverId: server.id,
          action: 'CREATE_ACCOUNT',
          protocol: 'ssh',
          username,
          password,
          activeDays,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // Listen for status change from the VPS daemon
        const unsubscribe = onSnapshot(cmdRef, (snap) => {
          const data = snap.data();
          if (data && data.status === 'success') {
            unsubscribe();
            setIsSubmitting(false);
            onAccountCreated(newAccount);
          } else if (data && data.status === 'error') {
            unsubscribe();
            setIsSubmitting(false);
            setErrorMessage(data.message || 'VPS failed to create account.');
          }
        });

        // Timeout fallback if VPS is offline (e.g. after 30 seconds)
        setTimeout(() => {
          unsubscribe();
          setIsSubmitting(false);
          setErrorMessage('Timeout: VPS daemon tidak merespon dalam 30 detik. Pastikan script auto-creator berjalan di VPS.');
        }, 30000);

      } catch (cmdErr) {
        console.warn("Gagal mengirim command ke VPS:", cmdErr);
        setIsSubmitting(false);
        setErrorMessage('Gagal menghubungi server database.');
      }`;

const oldBlock = `      // Bypass VPS daemon listening since this is a demo environment
      setTimeout(() => {
          setIsSubmitting(false);
          onAccountCreated(newAccount);
      }, 1500); // simulate 1.5s creation delay`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/SshCreateAccount.tsx', code);
