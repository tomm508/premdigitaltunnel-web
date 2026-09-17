import fs from 'fs';
let code = fs.readFileSync('src/components/AccountModal.tsx', 'utf8');

// I replaced too aggressively. Let's find exactly around line 273 and restore the loop bracket properly.
const badSyntax = `                          <div className="text-[9px] sm:text-[10px] text-slate-400">                            {isOnline ? \`\${srv.usedSlots}/\${srv.totalSlots} used\` : 'Node Mati'}                          </div>                        </div>                      </div>                    );                  }                  </div>                </div>                {/* Step 2: Account Details */}`;

// The original map closing tag must have been eaten.
const replaceWith = `                          <div className="text-[9px] sm:text-[10px] text-slate-400">                            {isOnline ? \`\${srv.usedSlots}/\${srv.totalSlots} used\` : 'Node Mati'}                          </div>                        </div>                      </div>                    );                  })}                  </div>                </div>                {/* Step 2: Account Details */}`;

// Let's just fix the bad bracket issue directly around line 275.
// We will replace '); }' with '); })}' or similar based on actual file state.
