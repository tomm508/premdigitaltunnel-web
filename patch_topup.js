import fs from 'fs';

let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

// Add useEffect import
code = code.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");

// Add onSnapshot import
code = code.replace("import { db, doc, setDoc, addDoc, collection } from '../lib/firebase';", "import { db, doc, setDoc, addDoc, collection, onSnapshot } from '../lib/firebase';");

// Add state for fetched Qris URL and useEffect
const target = `  const [copied, setCopied] = useState(false);`;

const replacement = `  const [copied, setCopied] = useState(false);
  const [fetchedQrisUrl, setFetchedQrisUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const unsub = onSnapshot(doc(db, 'platform', 'settings'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFetchedQrisUrl(data.qrisUrl || '');
        }
      });
      return () => unsub();
    }
  }, [isOpen]);

  const displayQrisUrl = qrisUrl || fetchedQrisUrl;`;

code = code.replace(target, replacement);

// Replace uses of qrisUrl with displayQrisUrl
code = code.replace(/{qrisUrl \?/g, "{displayQrisUrl ?");
code = code.replace(/<img src=\{qrisUrl\}/g, "<img src={displayQrisUrl}");

fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log("TopupModal patched to fetch qrisUrl from platform/settings.");
