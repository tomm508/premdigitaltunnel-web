const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Update Mobile Login Button to be conditionally rendered based on currentUser
const mobileLoginButton = `
            {/* Mobile Login Button */}
            <div className="pt-2">
              {currentUser ? (
                <button
                  id="mobile-dashboard-btn"
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 text-center"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  id="mobile-login-btn"
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 text-center"
                >
                  Login Member
                </button>
              )}
            </div>
`;

content = content.replace(
  /\{\/\* Mobile Login Button \*\/\}\s*<div className="pt-2">\s*<button[\s\S]*?<\/button>\s*<\/div>/,
  mobileLoginButton
);

fs.writeFileSync('src/components/Navbar.tsx', content);
