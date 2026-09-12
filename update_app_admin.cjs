const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Import AdminPanel
if (!content.includes('AdminPanel')) {
  content = content.replace(
    "import { Dashboard } from './components/Dashboard';",
    "import { Dashboard } from './components/Dashboard';\nimport { AdminPanel } from './components/AdminPanel';"
  );
}

// Add userRole state
if (!content.includes('userRole')) {
  content = content.replace(
    "const [userBalance, setUserBalance] = useState<number>(0);",
    "const [userBalance, setUserBalance] = useState<number>(0);\n  const [userRole, setUserRole] = useState<'member' | 'admin'>('member');"
  );
  
  // Update onSnapshot to set userRole
  content = content.replace(
    "setUserBalance(data.balance ?? 0);",
    "setUserBalance(data.balance ?? 0);\n        setUserRole(data.role ?? 'member');"
  );
}

// Pass userRole to Navbar
content = content.replace(
  "currentUser={currentUser}",
  "currentUser={currentUser}\n          userRole={userRole}"
);

// Add Route for AdminPanel
const adminRoute = `
              <Route path="/admin" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdminPanel
                    isDark={isDark}
                    userRole={userRole}
                  />
                </motion.div>
              } />
`;

if (!content.includes('path="/admin"')) {
  content = content.replace(
    "</Routes>",
    adminRoute + "\n            </Routes>"
  );
}

fs.writeFileSync('src/App.tsx', content);
