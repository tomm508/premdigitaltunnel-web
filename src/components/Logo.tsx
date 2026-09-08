import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
  isDark?: boolean;
}

export const LogoMark: React.FC<{ size?: number; className?: string; isDark?: boolean }> = ({ 
  size = 38, 
  className = '',
  isDark = true
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-2xl p-1.5 shadow-lg transition-all ${
        isDark 
          ? 'bg-gradient-to-tr from-[#1a123f] via-[#2a1d63] to-[#432388] shadow-purple-950/60 border border-purple-500/40 hover:border-purple-400' 
          : 'bg-gradient-to-tr from-purple-700 via-indigo-700 to-purple-900 shadow-purple-600/30 border border-purple-400/60 hover:border-purple-300'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Main glowing gradient for P and stroke */}
          <linearGradient id="pLogoGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e9d5ff" /> {/* Purple 200 */}
            <stop offset="40%" stopColor="#c084fc" /> {/* Purple 400 */}
            <stop offset="80%" stopColor="#818cf8" /> {/* Indigo 400 */}
            <stop offset="100%" stopColor="#38bdf8" /> {/* Sky 400 */}
          </linearGradient>

          {/* Electric bolt gradient */}
          <linearGradient id="boltGrad" x1="5" y1="55" x2="35" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* 1. Left Lightning Wave / Spark (Zig-zag di sebelah kiri tiang) */}
        <path
          d="M 12 50 L 19 43 L 15 37 L 24 29 L 20 29 L 29 20"
          stroke="url(#boltGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Titik awal pulsa sinyal */}
        <circle cx="12" cy="50" r="2.8" fill="#38bdf8" />

        {/* 2. Tiang Ganda Vertikal (Double vertical bars) */}
        {/* Tiang kiri */}
        <line
          x1="36"
          y1="22"
          x2="36"
          y2="80"
          stroke="url(#pLogoGrad)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Tiang kanan */}
        <line
          x1="45"
          y1="22"
          x2="45"
          y2="80"
          stroke="url(#pLogoGrad)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* 3. Lekukan Huruf P & Loop Bawah Menyilang */}
        {/* Loop atas P yang melingkar ke kanan */}
        <path
          d="M 45 23 C 68 19, 86 27, 85 45 C 84 60, 64 63, 45 63"
          stroke="url(#pLogoGrad)"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cursive swoosh bawah (kaki melengkung diagonal menyeberang) */}
        <path
          d="M 45 63 C 37 63, 27 68, 22 76 C 18 83, 26 86, 38 80 L 45 74"
          stroke="url(#pLogoGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 38, 
  withText = true,
  isDark = true 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Visual Logo Mark from sketch */}
      <LogoMark size={size} isDark={isDark} />

      {/* Typography */}
      {withText && (
        <div className="flex items-center gap-2 select-none font-extrabold tracking-tight text-lg sm:text-xl">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>
            PremDigital
          </span>
          <span className="px-1.5 py-0.5 rounded text-xs uppercase bg-purple-600/70 border border-purple-400/40 text-purple-100 font-black tracking-wider shadow-sm">
            TUNNEL
          </span>
        </div>
      )}
    </div>
  );
};
