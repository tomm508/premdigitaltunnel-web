import fs from 'fs';
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('.custom-scrollbar')) {
    code += `
/* Custom Scrollbar for better UX */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 26, 56, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.4);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.6);
}
`;
    fs.writeFileSync('src/index.css', code);
}
