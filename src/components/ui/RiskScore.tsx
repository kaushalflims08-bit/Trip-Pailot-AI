import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskScoreProps {
  level: 'low' | 'medium' | 'high';
  score?: number; // 0 to 100
  label?: string;
  className?: string;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  level,
  score = 15,
  label,
  className = '',
}) => {
  const configs = {
    low: {
      color: 'text-teal-500 bg-teal-500/15 border-teal-500/30',
      icon: ShieldCheck,
      text: 'Low Road Risk',
      textTa: 'குறைந்த சாலை ஆபத்து',
      sub: 'Clear ghat visibility, dry pavement, normal traffic speed',
    },
    medium: {
      color: 'text-amber-500 bg-amber-500/15 border-amber-500/30',
      icon: AlertTriangle,
      text: 'Moderate Caution',
      textTa: 'மிதமான எச்சரிக்கை',
      sub: 'Evening fog, 36 hairpin curves, heavy weekend tourist volume',
    },
    high: {
      color: 'text-red-500 bg-red-500/15 border-red-500/30',
      icon: ShieldAlert,
      text: 'High Road Risk',
      textTa: 'அதிக சாலை ஆபத்து',
      sub: 'Heavy monsoon showers, rockfall alert, night travel not recommended',
    },
  };

  const current = configs[level];
  const Icon = current.icon;

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${current.color} ${className}`}>
      <div className="p-2 rounded-lg bg-current/10 shrink-0">
        <Icon className="w-5 h-5 text-current" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-current">
            {label || current.text}
          </span>
          <span className="text-xs font-mono font-bold text-current">
            Risk Index: {score}/100
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
          {current.sub}
        </p>
      </div>
    </div>
  );
};
