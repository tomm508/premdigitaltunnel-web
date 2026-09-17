import fs from 'fs';
let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

code = code.replace(
  `} catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStep('waiting');
    }`,
  `} catch (e: any) {
      console.error(e);
      alert('Terjadi kesalahan: ' + e.message);
      setIsProcessing(false);
    }`
);

fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log("Patched error handler 2");
