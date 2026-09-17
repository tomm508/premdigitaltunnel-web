import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target1 = `  const [isTopupOpen, setIsTopupOpen] = useState(false);`;

const replacement1 = `  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [qrisUrl, setQrisUrl] = useState('');`;

const target2 = `        setTurnstileSiteKey(data.turnstileSiteKey || '');
      }
    });`;

const replacement2 = `        setTurnstileSiteKey(data.turnstileSiteKey || '');
        setQrisUrl(data.qrisUrl || '');
      }
    });`;

const target3 = `      <TopupModal 
        isOpen={isTopupOpen} 
        onClose={() => setIsTopupOpen(false)} 
        user={currentUser}
        balance={userBalance}
        onSuccessDeposit={(amount) => {
          setIsTopupOpen(false);
          fetchUserData(currentUser);
        }}
      />`;

const replacement3 = `      <TopupModal 
        isOpen={isTopupOpen} 
        onClose={() => setIsTopupOpen(false)} 
        user={currentUser}
        balance={userBalance}
        qrisUrl={qrisUrl}
        onSuccessDeposit={(amount) => {
          setIsTopupOpen(false);
          fetchUserData(currentUser);
        }}
      />`;

code = code.replace(target1, replacement1);
if (code.includes('setTurnstileSiteKey(data.turnstileSiteKey || \'\');')) {
  code = code.replace(target2, replacement2);
}
code = code.replace(target3, replacement3);
fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched Dashboard.tsx");
