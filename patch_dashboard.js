import fs from 'fs';
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const newBlock = `
        {/* Active Services */}
        <div className="pt-4">
          <h3 className="text-lg font-bold text-white mb-4">Your Active Services</h3>
          <div className="bg-[#1e2335] rounded-2xl p-10 border border-slate-700/50 text-center flex flex-col items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-slate-500 mb-4" />
            <h4 className="text-white font-bold mb-2">No Services Found</h4>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">You haven't created any accounts yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Create Your First Account
            </button>
          </div>
        </div>
`;

const oldBlock = `
        {/* Active Services */}
        <div className="pt-4">
          <h3 className="text-lg font-bold text-white mb-4">Your Active Services</h3>
          <div className="bg-[#1e2335] rounded-2xl p-10 border border-slate-700/50 text-center flex flex-col items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-slate-500 mb-4" />
            <h4 className="text-white font-bold mb-2">No Services Found</h4>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">You haven't created any accounts yet.</p>
            <button 
              onClick={() => navigate('/free')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Create Your First Account
            </button>
          </div>
        </div>
`;

code = code.replace(oldBlock.trim(), newBlock.trim());
fs.writeFileSync('src/components/Dashboard.tsx', code);
