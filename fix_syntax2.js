import fs from 'fs';
let code = fs.readFileSync('src/components/AccountModal.tsx', 'utf8');

// I accidentally overwrote the header. Let's fix it by carefully replacing the corrupted part.
const fixBlock = `
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#120d30]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {protocolService.name}
              </h3>
              <p className="text-xs text-purple-300/80">
                Generate active account with fast Cloudflare CDN support
              </p>
            </div>
          </div>
          <button
            id="close-account-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {!generatedAccount ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Step 1: Server Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2.5">
                  1. Select Tunnel Server Location
                </label>
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto p-1 pr-2 custom-scrollbar">
                  {liveServers.map((srv) => {
                    const isSelected = selectedServer.id === srv.id;
                    const isOnline = srv.status === 'Online';
                    return (
                      <div
                        key={srv.id}
                        id={\`server-select-\${srv.id}\`}
                        onClick={() => {
                          if (isOnline) setSelectedServer(srv);
                        }}
                        className={\`p-3 rounded-2xl border transition-all flex items-center justify-between \${
                          !isOnline
                            ? 'bg-[#120f28]/60 border-rose-900/30 text-slate-500 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-purple-600/20 border-purple-400 text-white shadow-md shadow-purple-600/20 cursor-pointer'
                            : 'bg-[#1b1542] border-purple-900/40 text-slate-300 hover:bg-[#20194e] hover:border-purple-500/30 cursor-pointer'
                        }\`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl sm:text-3xl">{srv.flag}</span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[13px] sm:text-sm text-white whitespace-nowrap">{srv.country}</span>
                              {isOnline ? (
                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap">
                                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  Online
                                </span>
                              ) : (
                                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 whitespace-nowrap">
                                  Offline
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] sm:text-xs text-slate-400">{srv.city}</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          <span className={\`text-[11px] sm:text-xs font-semibold \${isOnline ? 'text-emerald-400' : 'text-slate-500'}\`}>
                            {isOnline ? \`\${srv.ping}ms\` : 'Timeout'}
                          </span>
                          <div className="text-[9px] sm:text-[10px] text-slate-400">
                            {isOnline ? \`\${srv.usedSlots}/\${srv.totalSlots} used\` : 'Node Mati'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
`;

// we need to locate the start of {/* Modal Top Header */} and the start of {/* Step 2: Account Details */}
const startIdx = code.indexOf('{/* Modal Top Header */}');
const endIdx = code.indexOf('{/* Step 2: Account Details */}');

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + fixBlock.trim() + '\n\n              {/* Step 2: Account Details */}' + code.substring(endIdx + 31);
    fs.writeFileSync('src/components/AccountModal.tsx', code);
    console.log("Fixed!");
} else {
    console.log("Could not find boundaries");
}
