import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

// The qrisUrl prop is missing in <TopupModal /> inside App.tsx, but TopupModal has:
// const displayQrisUrl = qrisUrl || fetchedQrisUrl;
// Let's modify TopupModal to simply use fetchedQrisUrl if qrisUrl is undefined
code = code.replace(/const displayQrisUrl = qrisUrl \|\| fetchedQrisUrl;/g, 'const displayQrisUrl = qrisUrl || fetchedQrisUrl;');

fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log("Checked TopupModal.");
