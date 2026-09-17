import fs from 'fs';

const ADMIN_EMAILS = "['agustiantomi80@gmail.com', 'premdigitalssh@gmail.com']";

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replaceAll(
  `user.email?.toLowerCase() === 'agustiantomi80@gmail.com'`,
  `${ADMIN_EMAILS}.includes(user.email?.toLowerCase() || '')`
);
appCode = appCode.replaceAll(
  `currentUser.email?.toLowerCase() === 'agustiantomi80@gmail.com'`,
  `${ADMIN_EMAILS}.includes(currentUser.email?.toLowerCase() || '')`
);
appCode = appCode.replaceAll(
  `currentUser.email === 'agustiantomi80@gmail.com'`,
  `${ADMIN_EMAILS}.includes(currentUser.email?.toLowerCase() || '')`
);
fs.writeFileSync('src/App.tsx', appCode);

// Patch AuthModal.tsx
let authCode = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');
authCode = authCode.replaceAll(
  `user.email?.toLowerCase() === 'agustiantomi80@gmail.com'`,
  `${ADMIN_EMAILS}.includes(user.email?.toLowerCase() || '')`
);
fs.writeFileSync('src/components/AuthModal.tsx', authCode);
