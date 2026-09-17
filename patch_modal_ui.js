import fs from 'fs';
let code = fs.readFileSync('src/components/AccountModal.tsx', 'utf8');

const newBlock = `                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 pr-2 custom-scrollbar">`;
const oldBlock = `                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 pr-2">`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/AccountModal.tsx', code);
