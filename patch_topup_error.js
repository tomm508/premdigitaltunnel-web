import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

code = code.replace(
  `} catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStep('pay');
    }`,
  `} catch (e: any) {
      console.error(e);
      alert('Gagal membuat permintaan Top Up: ' + e.message);
      setIsProcessing(false);
    }`
);

fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log("Patched error handler");
