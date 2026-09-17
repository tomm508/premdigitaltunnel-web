import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Add import
if (!code.includes('UserSettingsModal')) {
  code = code.replace(
    "import { useNavigate } from 'react-router-dom';",
    "import { useNavigate } from 'react-router-dom';\nimport { UserSettingsModal } from './UserSettingsModal';"
  );
}

// Add state
if (!code.includes('isSettingsOpen')) {
  code = code.replace(
    'const [discount, setDiscount] = useState<number>(0);',
    'const [discount, setDiscount] = useState<number>(0);\n  const [isSettingsOpen, setIsSettingsOpen] = useState(false);'
  );
}

// Add onClick
code = code.replace(
  /<button \s*onClick=\{\(\) => \{\}\}\s*className="w-full sm:w-auto px-6 py-2\.5 rounded-xl bg-purple-600 hover:bg-purple-500/g,
  '<button onClick={() => setIsSettingsOpen(true)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500'
);

// Render modal at the end before last closing div
code = code.replace(
  /      <\/div>\n    <\/div>\n  \);\n\};\n?$/,
  `      </div>
      
      <UserSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={currentUser} 
      />
    </div>
  );
};
`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched Dashboard.tsx");
