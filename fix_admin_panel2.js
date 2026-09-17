import fs from 'fs';
let adminCode = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

adminCode = adminCode.replace(
  /hover:file:bg-emerald-600\/30 cursor-pointer"\s*\/>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="pt-4 flex items-center justify-between">/g,
  `hover:file:bg-emerald-600/30 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-between">`
);

fs.writeFileSync('src/components/AdminPanel.tsx', adminCode);
