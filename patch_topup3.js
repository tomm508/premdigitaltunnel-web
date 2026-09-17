import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

// I will just use the referrer policy bypass again because the issue is 100% related to postimg.cc blocking direct hotlinking without referrerPolicy="no-referrer"
// Actually, earlier the user said the image appeared in the admin email? Wait, "Munculnya diemail admin doang"
// Ah, the user is saying they pasted the URL, saved it, but when they test the TopUp form, the QRIS does NOT appear, but the ADMIN EMAIL receives something?
// Let me read the exact chat: "Munculnya diemail admin doang" and the video shows...
// I can't watch the video directly but the user says it only appears in the admin email.
// Wait, the video might show that the image doesn't load in TopupModal.
// Did I properly revert the proxy and restore `referrerPolicy="no-referrer"`?
// In revert_proxy2.js I accidentally removed the referrerPolicy!
console.log(code.match(/<img src=\{displayQrisUrl\}.+?\/>/g));
