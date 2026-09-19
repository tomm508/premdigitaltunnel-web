import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface MrPrediFloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const MrPrediFloatingButton: React.FC<MrPrediFloatingButtonProps> = ({
  onClick,
  isOpen
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
      {/* Speech Bubble Tooltip ala Maya AXISnet */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#190f41] border border-purple-500/40 text-white px-3.5 py-2 rounded-2xl shadow-xl shadow-purple-950/70 text-xs animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="font-medium">Tanya <strong className="text-purple-300">Mr. Predi</strong> yuk! 🎩✨</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-2xl shadow-purple-900/80 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
        title="Buka Chat Mr. Predi"
        aria-label="Live Chat Mr. Predi"
      >
        <div className="w-full h-full rounded-full bg-[#0e0926] flex items-center justify-center relative overflow-hidden">
          {/* Avatar Icon */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl transition-transform group-hover:scale-110">
              🎩
            </span>
          </div>

          {/* Pulse Ripple */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0e0926] animate-ping opacity-75"></span>
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0e0926]"></span>
        </div>
      </button>
    </div>
  );
};
