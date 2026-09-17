import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

const target = `fetch('https://formsubmit.co/ajax/agustiantomi80@gmail.com'`;
const replacement = `fetch('https://formsubmit.co/ajax/premdigitalssh@gmail.com'`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/TopupModal.tsx', code);
  console.log('Updated notification email to premdigitalssh@gmail.com');
} else {
  console.log('Could not find email address to replace');
}
