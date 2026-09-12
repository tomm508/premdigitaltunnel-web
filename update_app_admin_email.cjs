const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Force admin role for the user's email
content = content.replace(
  "setUserRole(data.role ?? 'member');",
  "setUserRole(currentUser.email === 'agustiantomi80@gmail.com' ? 'admin' : (data.role ?? 'member'));"
);

fs.writeFileSync('src/App.tsx', content);
