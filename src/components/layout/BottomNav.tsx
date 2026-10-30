import React from 'react';
import { Home, MapPin, Box, ShieldCheck, RefreshCw, FileText, AlertOctagon } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';

interface BottomNavProps {
  activeView: 'home' | 'slideshow';
  onNavigateHome: () => void;
  onNavigateSlide: (slideNumber: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigateHome,
  onNavigateSlide,
}) => {
  const { currentStep } = useTripStore();

  const items = [
    { id: 'home', label: 'Explore', icon: Home, isHome: true },
    { id: 1, label: 'Planner', icon: MapPin },
    { id: 2, label: 'Package', icon: Box },
    { id: 4, label: 'Live Shield', icon: ShieldCheck, highlight: true },
    { id: 5, label: 'Replan', icon: RefreshCw },
    { id: 6, label: 'Dossier', icon: FileText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-slate-200/60 dark:border-slate-800/60 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isSelected = item.isHome
            ? activeView === 'home'
            : activeView === 'slideshow' && currentStep === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isHome) onNavigateHome();
                else onNavigateSlide(item.id as number);
              }}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all min-w-[50px] min-h-[46px] cursor-pointer ${
                isSelected
                  ? 'text-[#FF7A1A] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  item.highlight && isSelected
                    ? 'bg-[#14B8A6] text-white'
                    : isSelected
                    ? 'bg-[#FF7A1A]/15'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
