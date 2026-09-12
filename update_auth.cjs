const fs = require('fs');
let content = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

content = content.replace(
  "import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc } from '../lib/firebase';",
  "import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, db, doc, getDoc, setDoc } from '../lib/firebase';"
);

// Add state for email/password
content = content.replace(
  "const [errorMsg, setErrorMsg] = useState('');",
  "const [errorMsg, setErrorMsg] = useState('');\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');"
);

// Add handlers for Email/Password
const newHandlers = `
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: 'Member',
          balance: 0,
          role: 'member',
          createdAt: new Date().toISOString()
        });
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (isLogin ? 'Gagal login.' : 'Gagal mendaftar.'));
    } finally {
      setIsProcessing(false);
    }
  };
`;
content = content.replace(
  "const handleGoogleSignIn = async () => {",
  newHandlers + "\n  const handleGoogleSignIn = async () => {"
);

// Update form onSubmit
content = content.replace(
  '<form onSubmit={(e) => { e.preventDefault(); handleGoogleSignIn(); }} className="space-y-5">',
  '<form onSubmit={handleEmailAuth} className="space-y-5">'
);

// Update inputs to be controlled
content = content.replace(
  /type="email"\s+required\s+placeholder="Enter your email"/,
  'type="email"\n                      required\n                      value={email}\n                      onChange={(e) => setEmail(e.target.value)}\n                      placeholder="Enter your email"'
);

content = content.replace(
  /type="password"\s+required\s+placeholder="Enter your password"/,
  'type="password"\n                      required\n                      value={password}\n                      onChange={(e) => setPassword(e.target.value)}\n                      placeholder="Enter your password"'
);

// Toggle between Sign In and Sign Up in the toggle link
content = content.replace(
  /<p className="text-xs text-slate-400">[\s\S]*?Don't have an account\? <a href="#" className="text-indigo-400 font-medium hover:text-indigo-300">Sign up<\/a>[\s\S]*?<\/p>/,
  `{isLogin ? (
                  <p className="text-xs text-slate-400">
                    Don't have an account? <button type="button" onClick={() => { setIsLogin(false); setErrorMsg(''); }} className="text-indigo-400 font-medium hover:text-indigo-300">Sign up</button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Already have an account? <button type="button" onClick={() => { setIsLogin(true); setErrorMsg(''); }} className="text-indigo-400 font-medium hover:text-indigo-300">Sign in</button>
                  </p>
                )}`
);

// Update sign in button text based on mode
content = content.replace(
  /<span>Sign in<\/span>/,
  '<span>{isProcessing ? "Processing..." : (isLogin ? "Sign in" : "Sign up")}</span>'
);

// Add missing error clearing logic for successful google auth
content = content.replace(
  /setIsProcessing\(false\);\s+onClose\(\);\s+\} catch/g,
  "setIsProcessing(false);\n      onClose();\n    } catch"
);

fs.writeFileSync('src/components/AuthModal.tsx', content);
