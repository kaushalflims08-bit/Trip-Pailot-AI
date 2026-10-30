import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'danger' | 'success';
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  glow = false,
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card text-slate-800 dark:text-slate-100',
    accent: 'bg-gradient-to-br from-[#FF7A1A]/10 to-[#0B1F3A]/20 backdrop-blur-xl border border-[#FF7A1A]/30 text-slate-900 dark:text-white',
    danger: 'bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-900 dark:text-red-100',
    success: 'bg-teal-500/10 backdrop-blur-xl border border-teal-500/30 text-teal-900 dark:text-teal-100',
  };

  const glowStyle = glow ? 'shadow-[0_0_25px_rgba(255,122,26,0.25)]' : 'shadow-lg';

  return (
    <div
      className={`rounded-2xl p-5 transition-all duration-300 ${variantStyles[variant]} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
