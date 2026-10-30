import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'teal' | 'navy' | 'amber' | 'red' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'orange',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variants = {
    orange: 'bg-[#FF7A1A]/15 text-[#FF7A1A] border-[#FF7A1A]/30',
    teal: 'bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/30',
    navy: 'bg-[#0B1F3A]/20 text-blue-300 border-blue-400/30',
    amber: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    red: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
    slate: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      <span>{children}</span>
    </span>
  );
};

export const DemoBadge: React.FC<{ label?: string }> = ({ label = 'Demo data' }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
    <span className="w-1 h-1 rounded-full bg-amber-500" />
    {label}
  </span>
);
