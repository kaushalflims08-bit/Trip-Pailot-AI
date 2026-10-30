import React from 'react';
import { useTripStore } from '../../store/useTripStore';
import { convertInr } from '../../services/currency';

interface BudgetProgressProps {
  spent: number;
  total: number;
  showDetails?: boolean;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  spent,
  total,
  showDetails = true,
}) => {
  const { currency, exchangeRates } = useTripStore();
  const percentage = Math.min(Math.round((spent / total) * 100), 100);
  const isOver = spent > total;
  const isWarning = spent > total * 0.85 && !isOver;

  let colorClass = 'from-teal-500 to-emerald-400';
  let badgeColor = 'text-teal-500 bg-teal-500/10 border-teal-500/20';
  if (isOver) {
    colorClass = 'from-red-600 to-rose-500';
    badgeColor = 'text-red-500 bg-red-500/10 border-red-500/20';
  } else if (isWarning) {
    colorClass = 'from-amber-500 to-orange-400';
    badgeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  }

  // Circular ring calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              className="text-slate-200 dark:text-slate-800"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              className={isOver ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-teal-500'}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">
              {percentage}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">used</span>
          </div>
        </div>

        {/* Details & Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Spent so far</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}>
              {isOver
                ? `Over by ₹${(spent - total).toLocaleString('en-IN')}${currency !== 'INR' ? ` (≈ ${convertInr(spent - total, currency, exchangeRates).formatted})` : ''}`
                : `₹${(total - spent).toLocaleString('en-IN')} left${currency !== 'INR' ? ` (≈ ${convertInr(total - spent, currency, exchangeRates).formatted})` : ''}`}
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {showDetails && (
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 dark:text-slate-200">
                ₹{spent.toLocaleString('en-IN')}
                {currency !== 'INR' && (
                  <span className="text-[10px] text-emerald-500 ml-1">
                    (≈ {convertInr(spent, currency, exchangeRates).formatted})
                  </span>
                )}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                Budget: ₹{total.toLocaleString('en-IN')}
                {currency !== 'INR' && (
                  <span className="text-[10px] text-slate-400 ml-1">
                    (≈ {convertInr(total, currency, exchangeRates).formatted})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
