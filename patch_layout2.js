import fs from 'fs';
let code = fs.readFileSync('src/components/AccountModal.tsx', 'utf8');

// The layout was originally:
// <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 pr-2">
// Now it's:
// <div className="flex flex-col gap-3 max-h-64 overflow-y-auto p-1 pr-2 custom-scrollbar">

// Let's modify the items inside to make sure they wrap correctly on smaller screens.
const oldItem = `                        <div className="flex items-center gap-2.5">                          <span className="text-2xl">{srv.flag}</span>                          <div>                            <div className="flex items-center gap-1.5">                              <span className="font-bold text-sm text-white">{srv.country}</span>                              {isOnline ? (                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>                                  Online                                </span>                              ) : (                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">                                  Offline                                </span>                              )}                            </div>                            <span className="text-xs text-slate-400">{srv.city}</span>                          </div>                        </div>                        <div className="text-right">                          <span className={\`text-xs font-semibold \${isOnline ? 'text-emerald-400' : 'text-slate-500'}\`}>                            {isOnline ? \`\${srv.ping}ms\` : 'Timeout'}                          </span>                          <div className="text-[10px] text-slate-400">                            {isOnline ? \`\${srv.usedSlots}/\${srv.totalSlots} used\` : 'Node Mati'}                          </div>                        </div>`;

const newItem = `                        <div className="flex items-center gap-3">                          <span className="text-2xl sm:text-3xl">{srv.flag}</span>                          <div className="flex flex-col">                            <div className="flex items-center gap-2 flex-wrap">                              <span className="font-bold text-[13px] sm:text-sm text-white whitespace-nowrap">{srv.country}</span>                              {isOnline ? (                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap">                                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>                                  Online                                </span>                              ) : (                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 whitespace-nowrap">                                  Offline                                </span>                              )}                            </div>                            <span className="text-[11px] sm:text-xs text-slate-400">{srv.city}</span>                          </div>                        </div>                        <div className="text-right flex flex-col justify-center">                          <span className={\`text-[11px] sm:text-xs font-semibold \${isOnline ? 'text-emerald-400' : 'text-slate-500'}\`}>                            {isOnline ? \`\${srv.ping}ms\` : 'Timeout'}                          </span>                          <div className="text-[9px] sm:text-[10px] text-slate-400">                            {isOnline ? \`\${srv.usedSlots}/\${srv.totalSlots} used\` : 'Node Mati'}                          </div>                        </div>`;

const cleanOldItem = oldItem.replace(/\s+/g, ' ');
const cleanNewItem = newItem.replace(/\s+/g, ' ');

let found = false;
let startIdx = 0;
while(true) {
    const window = code.substring(startIdx, startIdx + 2000).replace(/\s+/g, ' ');
    if (window.includes('className="flex items-center gap-2.5"')) {
        console.log("Found target region");
        // We will just do a simpler replace strategy using regex since whitespace is messy
        break;
    }
    startIdx += 500;
    if (startIdx > code.length) break;
}

code = code.replace(
  /<div className="flex items-center gap-2\.5">[\s\S]*?<span className={`text-xs font-semibold \${isOnline \? 'text-emerald-400' : 'text-slate-500'}`}>\s*{isOnline \? `\${srv\.ping}ms` : 'Timeout'}\s*<\/span>\s*<div className="text-\[10px\] text-slate-400">\s*{isOnline \? `\${srv\.usedSlots}\/\${srv\.totalSlots} used` : 'Node Mati'}\s*<\/div>\s*<\/div>/m,
  newItem
);

fs.writeFileSync('src/components/AccountModal.tsx', code);
