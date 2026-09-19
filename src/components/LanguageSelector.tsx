import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageSelectorProps {
  isDark: boolean;
  className?: string;
  isMobile?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  isDark, 
  className = '',
  isMobile = false 
}) => {
  const { language, setLanguage, t, triggerGoogleTranslate } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string; native: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧', native: 'English (Default)' },
    { code: 'id', label: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' }
  ];

  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 my-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Language / Bahasa</span>
        </div>
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === l.code
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.flag} {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        id="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          isDark
            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 hover:text-white'
            : 'bg-white hover:bg-slate-50 border-purple-200 text-slate-700 hover:text-purple-700 shadow-sm'
        }`}
        title="Change Language / Ganti Bahasa"
      >
        <Globe className="w-3.5 h-3.5 text-purple-400" />
        <span className="uppercase tracking-wider font-bold">{language}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''} text-slate-400`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl z-50 p-1.5 transition-all animate-in fade-in duration-150 ${
            isDark 
              ? 'bg-[#18133b] border-purple-500/30 shadow-purple-950/60 text-slate-200' 
              : 'bg-white border-purple-200 shadow-purple-900/15 text-slate-800'
          }`}
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-white/5 mb-1">
            Language / Bahasa
          </div>

          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                language === l.code
                  ? (isDark ? 'bg-purple-600/30 text-purple-200 font-bold' : 'bg-purple-50 text-purple-700 font-bold')
                  : (isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700')
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.native}</span>
              </span>
              {language === l.code && <Check className="w-3.5 h-3.5 text-purple-400" />}
            </button>
          ))}

          <div className="my-1 border-t border-white/10 dark:border-purple-500/20"></div>

          <button
            onClick={() => {
              triggerGoogleTranslate();
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium text-left transition-colors ${
              isDark 
                ? 'text-cyan-300 hover:bg-cyan-500/10' 
                : 'text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>More Languages...</span>
          </button>
        </div>
      )}
    </div>
  );
};
