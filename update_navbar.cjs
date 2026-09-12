const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Replace onClick={onOpenAuth} with onClick={() => navigate('/dashboard')} in the logged-in button
content = content.replace(
  '<button\n                  id="header-user-profile-btn"\n                  onClick={onOpenAuth}',
  '<button\n                  id="header-user-profile-btn"\n                  onClick={() => navigate("/dashboard")}'
);

content = content.replace(
  /<button\s+id="header-user-profile-btn"\s+onClick=\{onOpenAuth\}/g,
  '<button id="header-user-profile-btn" onClick={() => navigate("/dashboard")}'
);

fs.writeFileSync('src/components/Navbar.tsx', content);
