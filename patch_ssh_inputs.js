import fs from 'fs';
let code = fs.readFileSync('src/components/SshCreateAccount.tsx', 'utf8');

code = code.replace(
  "setUsername(`prem_${randNum}`);",
  "setUsername('');"
).replace(
  "setPassword(Math.random().toString(36).slice(-8));",
  "setPassword('');"
);

fs.writeFileSync('src/components/SshCreateAccount.tsx', code);
