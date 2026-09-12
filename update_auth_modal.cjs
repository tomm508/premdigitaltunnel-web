const fs = require('fs');
let content = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

// Add useNavigate and useEffect imports
if (!content.includes('useNavigate')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';");
}

// Add useEffect inside the component
const effectCode = `
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && currentUser) {
      onClose();
      navigate('/dashboard');
    }
  }, [currentUser, isOpen, navigate, onClose]);
`;

content = content.replace(
  "const [password, setPassword] = useState('');",
  "const [password, setPassword] = useState('');\n" + effectCode
);

// We should also remove the rendering of "Logged in view" entirely to make it cleaner,
// but since useEffect will close it immediately, it won't be seen anyway. Let's replace the whole {currentUser ? (...) : (...)} block.
const loginFormOnly = `
          {/* Login Form */
            <div className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-400 font-serif text-lg leading-none">@</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#232a42] border border-indigo-500/40 focus:border-indigo-400 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400/50 text-sm transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#232a42] border border-slate-600/50 focus:border-slate-500 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500/50 text-sm transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Remember Me & Forgot Password (Only on Login) */}
                {isLogin && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-4 h-4 rounded bg-[#232a42] border border-slate-600 group-hover:border-indigo-400 flex items-center justify-center">
                         {/* Unchecked state by default visually */}
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                    </label>
                    <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}

                {/* Sign In Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#8b3dff] hover:bg-[#7e36e8] shadow-lg shadow-[#8b3dff]/20 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                  >
                    <Lock className="w-4 h-4 opacity-70" />
                    <span>{isProcessing ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}</span>
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center py-2">
                <div className="flex-1 border-t border-slate-700/70"></div>
                <span className="px-4 text-[11px] text-slate-400">Or continue with</span>
                <div className="flex-1 border-t border-slate-700/70"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-slate-200 bg-[#2a3249] hover:bg-[#323b54] border border-slate-600/50 flex items-center justify-center gap-3 cursor-pointer transition-all disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z" />
                </svg>
                <span>{isProcessing ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>

              {/* Sign Up / Sign In Toggle Link */}
              <div className="text-center pt-2">
                {isLogin ? (
                  <p className="text-xs text-slate-400">
                    Don't have an account? <button type="button" onClick={() => { setIsLogin(false); setErrorMsg(''); }} className="text-indigo-400 font-medium hover:text-indigo-300">Sign up</button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Already have an account? <button type="button" onClick={() => { setIsLogin(true); setErrorMsg(''); }} className="text-indigo-400 font-medium hover:text-indigo-300">Sign in</button>
                  </p>
                )}
              </div>
            </div>}
`;

content = content.replace(/\{currentUser \? \([\s\S]*?\) : \([\s\S]*?\{/\* Login Form \*\//, "{/* Login Form */");
content = content.replace(/<\/div>\s*\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};/, "</div>\n        </div>\n      </div>\n    </div>\n  );\n};");


fs.writeFileSync('src/components/AuthModal.tsx', content);
