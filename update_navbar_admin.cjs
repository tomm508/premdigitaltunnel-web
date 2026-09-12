const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!content.includes('userRole')) {
  // Update NavbarProps
  content = content.replace(
    "currentUser?: User | null;",
    "currentUser?: User | null;\n  userRole?: 'member' | 'admin';"
  );

  content = content.replace(
    "currentUser,",
    "currentUser,\n  userRole = 'member',"
  );

  // Add Admin Button next to the profile button
  const adminBtn = `
                {userRole === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                    title="Admin Panel"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                )}
`;

  content = content.replace(
    '<button\n                  id="header-balance-chip"',
    adminBtn + '\n                <button\n                  id="header-balance-chip"'
  );
  
  // Add Shield icon to imports if missing
  if (!content.includes('Shield')) {
      content = content.replace("import { Wallet } from 'lucide-react';", "import { Wallet, Shield } from 'lucide-react';");
  }

  // Add Admin to Mobile Menu
  const mobileAdminBtn = `
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center mb-2"
                >
                  Admin Panel
                </button>
              )}
`;
  content = content.replace(
    '{/* Mobile Login Button */',
    mobileAdminBtn + '\n            {/* Mobile Login Button */'
  );
  
}

fs.writeFileSync('src/components/Navbar.tsx', content);
