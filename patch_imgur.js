import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target = `onChange={(e) => setQrisUrl(e.target.value)}`;

const replacement = `onChange={(e) => {
                                let val = e.target.value;
                                if (val.includes("imgur.com/a/")) {
                                  const id = val.split("imgur.com/a/")[1].split("?")[0].split("/")[0];
                                  val = \`https://i.imgur.com/\${id}.jpg\`;
                                } else if (val.includes("imgur.com/") && !val.includes("i.imgur.com/")) {
                                  const id = val.split("imgur.com/")[1].split("?")[0].split("/")[0];
                                  val = \`https://i.imgur.com/\${id}.jpg\`;
                                }
                                setQrisUrl(val);
                              }}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("AdminPanel patched to auto-correct imgur links.");
