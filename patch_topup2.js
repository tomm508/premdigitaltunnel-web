import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

// There's a bug where fetchedQrisUrl might not update the DOM immediately or properly due to React batching/renders. 
// We should check the image rendering part.
// Wait, is there a typo in the image tag in TopupModal?
console.log(code.includes('<img src={displayQrisUrl} alt="QRIS" className="w-full h-full object-contain" />'));
