import React, { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

export const PlaneFlyAcross: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(false);
      onComplete?.();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div
        className="absolute top-1/3 flex items-center gap-2"
        style={{
          animation: 'planeFly 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        }}
      >
        {/* Dotted orange trail */}
        <div className="w-48 h-0.5 border-b-2 border-dashed border-[#FF7A1A]/80 shadow-[0_0_8px_#FF7A1A]" />
        <div className="p-2.5 rounded-full bg-[#FF7A1A] text-white shadow-[0_0_20px_#FF7A1A] transform rotate-45">
          <Plane className="w-6 h-6 fill-white" />
        </div>
      </div>
      <style>{`
        @keyframes planeFly {
          0% {
            left: -150px;
            transform: translateY(60px) rotate(-10deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            left: 110vw;
            transform: translateY(-80px) rotate(-15deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
