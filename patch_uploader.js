import fs from 'fs';

let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = '<p className="text-[10px] text-slate-500 mt-2">Tempel (paste) link/URL gambar QRIS Anda di sini.</p>';
const uploaderCode = targetStr + `
                          </div>
                          {qrisUrl && (
                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-600 p-1">
                              <SafeImage src={qrisUrl} alt="QRIS Preview" className="w-full h-full object-contain rounded-lg" />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <label className="block text-xs font-bold text-emerald-400 mb-2">Atau Unggah Gambar dari HP (Otomatis & Anti-Error)</label>
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
                                  
                                  // Compress to JPEG with 0.8 quality to ensure it fits in Firestore (1MB limit)
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                  setQrisUrl(dataUrl);
                                };
                                img.src = event.target?.result;
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-600/20 file:text-emerald-400 hover:file:bg-emerald-600/30 cursor-pointer"
                          />
`;

// Replace from target string down to the end of the flex container
const regex = /<p className="text-\[10px\] text-slate-500 mt-2">Tempel \(paste\) link\/URL gambar QRIS Anda di sini\.<\/p>[\s\S]*?<\/div>\s*<\/div>/;
adminCode = adminCode.replace(regex, uploaderCode);

fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);
console.log("Patched AdminPanel with Image Uploader.");
