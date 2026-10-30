import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';

export const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTripStore();

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-amber-400 animate-in zoom-in-75 duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 animate-in zoom-in-75 duration-200" />
      )}
    </button>
  );
};
