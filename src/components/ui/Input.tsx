import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isValid,
  leftIcon,
  rightAction,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          disabled={disabled}
          className={`w-full rounded-xl bg-white/70 dark:bg-slate-900/60 border ${
            error
              ? 'border-red-500 focus:ring-red-400'
              : isValid
              ? 'border-teal-500/80 focus:ring-teal-400'
              : 'border-slate-300 dark:border-slate-700/80 focus:ring-[#FF7A1A]'
          } px-4 py-2.5 ${leftIcon ? 'pl-10' : ''} ${
            rightAction || isValid || error ? 'pr-10' : ''
          } text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[44px] ${className}`}
          {...props}
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {isValid && !error && <Check className="w-4 h-4 text-teal-500 animate-in fade-in" />}
          {error && <AlertCircle className="w-4 h-4 text-red-500 animate-in fade-in" />}
          {rightAction}
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 pl-1 font-medium">{error}</p>}
    </div>
  );
};
