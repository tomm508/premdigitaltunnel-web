import fs from 'fs';

let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

const target1 = `  onSuccessDeposit: (amount: number) => void;
}`;

const replacement1 = `  onSuccessDeposit: (amount: number) => void;
  qrisUrl?: string;
}`;

const target2 = `  onSuccessDeposit
}) => {`;

const replacement2 = `  onSuccessDeposit,
  qrisUrl
}) => {`;

const target3 = `              {/* QR Code / Pay instructions */}
              <div className="p-6 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                <div className="w-44 h-44 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white text-center">
                  <QrCode className="w-24 h-24 text-purple-400 mb-1" />
                  <span className="text-[11px] font-bold text-purple-200">QRIS STANDAR</span>
                  <span className="text-[9px] text-slate-400">premdigital.web.id</span>
                </div>
              </div>`;

const replacement3 = `              {/* QR Code / Pay instructions */}
              <div className="p-6 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                {qrisUrl ? (
                  <div className="w-44 h-44 rounded-xl flex items-center justify-center overflow-hidden bg-slate-100">
                    <img src={qrisUrl} alt="QRIS" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white text-center">
                    <QrCode className="w-24 h-24 text-purple-400 mb-1" />
                    <span className="text-[11px] font-bold text-purple-200">QRIS STANDAR</span>
                    <span className="text-[9px] text-slate-400">premdigital.web.id</span>
                  </div>
                )}
              </div>`;

code = code.replace(target1, replacement1).replace(target2, replacement2).replace(target3, replacement3);
fs.writeFileSync('src/components/TopupModal.tsx', code);
console.log("Patched TopupModal.tsx");
