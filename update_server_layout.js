import fs from 'fs';

let code = fs.readFileSync('src/components/AccountModal.tsx', 'utf8');
const oldGrid = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 pr-2 custom-scrollbar">`;
const newGrid = `<div className="flex flex-col gap-3 max-h-64 overflow-y-auto p-1 pr-2 custom-scrollbar">`;

code = code.replace(oldGrid, newGrid);
fs.writeFileSync('src/components/AccountModal.tsx', code);
