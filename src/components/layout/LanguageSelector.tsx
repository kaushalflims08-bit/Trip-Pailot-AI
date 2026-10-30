import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { languages, LanguageCode } from '../../i18n';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useTripStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-300/60 dark:border-slate-700/60 transition-all min-h-[44px] cursor-pointer"
      >
        <Globe className="w-4 h-4 text-[#FF7A1A]" />
        <span>{compact ? currentLang.code.toUpperCase() : currentLang.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-card border border-white/20 dark:border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/40 dark:border-slate-700/40 mb-1">
            Choose Language / மொழி
          </div>
          {languages.map((l) => {
            const isSelected = l.code === language;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code as LanguageCode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ${
                  isSelected ? 'text-[#FF7A1A] font-bold bg-[#FF7A1A]/10' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <div>
                  <div className={l.code === 'ta' ? 'font-tamil' : ''}>{l.nativeName}</div>
                  <div className="text-[10px] text-slate-400">{l.name}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#FF7A1A]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
