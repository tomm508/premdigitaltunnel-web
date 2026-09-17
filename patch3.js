import fs from 'fs';
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');
code = code.replaceAll(
`role: 'member'`,
`role: user.email?.toLowerCase() === 'agustiantomi80@gmail.com' ? 'admin' : 'member'`
);
fs.writeFileSync('src/components/AuthModal.tsx', code);
