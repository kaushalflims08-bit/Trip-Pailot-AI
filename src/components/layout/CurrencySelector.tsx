import React, { useState, useRef, useEffect } from 'react';
import { Coins, Check, RefreshCw } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { SUPPORTED_CURRENCIES, fetchLiveExchangeRates } from '../../services/currency';

export const CurrencySelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currency, setCurrency, exchangeRates, fetchRates } = useTripStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync live rates on mount
  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await fetchRates();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const currentMeta =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select currency"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-300/60 dark:border-slate-700/60 transition-all min-h-[44px] cursor-pointer"
      >
        <span className="text-sm">{currentMeta.flag}</span>
        <span className="font-bold">{currentMeta.symbol}</span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {currentMeta.code}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-white/20 dark:border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200/40 dark:border-slate-700/40 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Currency / நாணயம்
            </span>
            <button
              onClick={handleRefresh}
              title="Refresh live rates from open API"
              className="text-slate-400 hover:text-[#FF7A1A] p-0.5"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100/30 dark:divide-slate-800/30">
            {SUPPORTED_CURRENCIES.map((c) => {
              const isSelected = c.code === currency;
              const rate = exchangeRates[c.code] || 1;
              const inrPerUnit = c.code === 'INR' ? 1 : Math.round(1 / rate);

              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    isSelected ? 'text-[#FF7A1A] font-bold bg-[#FF7A1A]/10' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{c.code}</span>
                        <span className="text-slate-400 text-[11px]">({c.symbol})</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.code === 'INR' ? 'Base Currency' : `1 ${c.code} ≈ ₹${inrPerUnit}`}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#FF7A1A]" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 pt-2 text-[9px] text-slate-400 text-center border-t border-slate-200/40 dark:border-slate-800/40 mt-1">
            Real-time rates via Open Exchange Rates API
          </div>
        </div>
      )}
    </div>
  );
};
