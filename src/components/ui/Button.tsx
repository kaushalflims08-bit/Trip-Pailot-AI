import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/50 min-h-[44px]';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base font-semibold gap-2.5',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-[#FF7A1A] to-[#ff9138] text-white shadow-md shadow-[#FF7A1A]/30 hover:brightness-110 border border-[#FF7A1A]/50',
    secondary: 'bg-[#0B1F3A] text-white hover:bg-[#142f54] border border-white/10 dark:bg-[#112a4d]',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 hover:brightness-110',
    ghost: 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300',
    glass: 'glass-card hover:bg-white/80 dark:hover:bg-[#0B1F3A]/90 text-slate-900 dark:text-white border border-white/40 dark:border-white/10 shadow-sm',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
