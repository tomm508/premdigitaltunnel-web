import fs from 'fs';

let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

// Add Upload icon import
code = code.replace(
  "CreditCard",
  "CreditCard,\n  Upload"
);

// Add state for proofUrl
code = code.replace(
  "const [fetchedQrisUrl, setFetchedQrisUrl] = useState<string>('');",
  "const [fetchedQrisUrl, setFetchedQrisUrl] = useState<string>('');\n  const [proofUrl, setProofUrl] = useState<string>('');"
);

// Update addDoc to include proofUrl (wait, proofUrl is selected during step 'pay', so we should update the document when submitting proof, OR just save the base64 string to topups document)
// In handleSimulatePaymentSuccess:
const handleReplaceStr = `  const handleSimulatePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      if (user && currentTopupId) {
        // Update topup status to waiting_verification instead of instantly adding balance
        await setDoc(doc(db, 'topups', currentTopupId), {
          status: 'waiting_verification',
          proofUrl: proofUrl || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      setIsProcessing(false);
      setStep('waiting');
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStep('waiting');
    }
  };`;
  
code = code.replace(
  /  const handleSimulatePaymentSuccess = async \(\) => \{[\s\S]*?  \};/,
  handleReplaceStr
);

// Add the upload UI before the "Konfirmasi Sudah Bayar" button
const uploadUI = `
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <label className="block text-xs font-bold text-slate-300 mb-2">Upload Bukti Transfer (Opsional)</label>
                <div className="flex items-center gap-3">
                  {proofUrl && (
                    <div className="w-12 h-12 bg-black/50 rounded-lg overflow-hidden border border-purple-500/30 flex-shrink-0">
                      <img src={proofUrl} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_WIDTH = 600;
                          const MAX_HEIGHT = 600;
                          let width = img.width;
                          let height = img.height;
                          
                          if (width > height) {
                            if (width > MAX_WIDTH) {
                              height *= MAX_WIDTH / width;
                              width = MAX_WIDTH;
                            }
                          } else {
                            if (height > MAX_HEIGHT) {
                              width *= MAX_HEIGHT / height;
                              height = MAX_HEIGHT;
                            }
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0, width, height);
                          
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                          setProofUrl(dataUrl);
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">`;

code = code.replace(
  /<div className="flex gap-2">/g,
  uploadUI
);

// Reset state when closing or starting new topup
code = code.replace(
  "setCustomAmount('');\n    setStep('select');\n  }",
  "setCustomAmount('');\n    setStep('select');\n    setProofUrl('');\n  }"
);
code = code.replace(
  "setCustomAmount('');\n    setStep('select');\n    onClose();\n  }",
  "setCustomAmount('');\n    setStep('select');\n    setProofUrl('');\n    onClose();\n  }"
);

fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log("Patched TopupModal.tsx");
