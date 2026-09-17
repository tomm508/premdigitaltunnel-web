import fs from 'fs';

const safeImageComponent = `
function SafeImage({ src, alt, className }: { src: string, alt: string, className: string }) {
  const [blobUrl, setBlobUrl] = React.useState<string>(src);
  
  React.useEffect(() => {
    if (!src || !src.startsWith('http')) {
      setBlobUrl(src);
      return;
    }
    
    let isMounted = true;
    fetch(src)
      .then(res => res.blob())
      .then(blob => {
        if (isMounted) {
          setBlobUrl(URL.createObjectURL(blob));
        }
      })
      .catch(err => {
        console.error("SafeImage fetch error:", err);
        // Fallback to normal src if fetch fails
      });
      
    return () => {
      isMounted = false;
    };
  }, [src]);

  return <img src={blobUrl} alt={alt} className={className} />;
}
`;

let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminCode = adminCode.replace('export const AdminPanel', safeImageComponent + '\nexport const AdminPanel');
adminCode = adminCode.replace(
  /<img src=\{qrisUrl \+ \(qrisUrl\.includes\("\?"\) \? "&" \: "\?"\) \+ "v=2"\} alt="QRIS Preview".*?\/>/,
  '<SafeImage src={qrisUrl} alt="QRIS Preview" className="w-full h-full object-contain rounded-lg" />'
);
fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);

let topupCode = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');
topupCode = topupCode.replace('export const TopupModal', safeImageComponent + '\nexport const TopupModal');
topupCode = topupCode.replace(
  /<img src=\{displayQrisUrl \+ \(displayQrisUrl\.includes\("\?"\) \? "&" \: "\?"\) \+ "v=2"\} alt="QRIS".*?\/>/,
  '<SafeImage src={displayQrisUrl} alt="QRIS" className="w-full h-full object-contain" />'
);
fs.writeFileSync('src/components/TopupModal.tsx', topupCode);

console.log("Patched SafeImage.");
