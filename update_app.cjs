const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Import Dashboard
content = content.replace(
  "import { FreeTunneling } from './components/FreeTunneling';",
  "import { FreeTunneling } from './components/FreeTunneling';\nimport { Dashboard } from './components/Dashboard';"
);

// Add Route for Dashboard
const dashboardRoute = `
              <Route path="/dashboard" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard
                    isDark={isDark}
                    currentUser={currentUser}
                    userBalance={userBalance}
                    onOpenTopup={() => setIsTopupModalOpen(true)}
                    onLogout={() => {
                      signOut(auth);
                      navigate('/');
                    }}
                  />
                </motion.div>
              } />
`;

content = content.replace(
  "</Routes>",
  dashboardRoute + "\n            </Routes>"
);

fs.writeFileSync('src/App.tsx', content);
