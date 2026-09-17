import fs from 'fs';
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if(code.includes('Your Active Services')) {
    console.log("Dashboard has active services section");
}
