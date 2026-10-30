import React from 'react';
import { useTripStore } from '../../store/useTripStore';

interface AnimatedBackgroundProps {
  variant?: 'login' | 'splash' | 'home' | 'planner' | 'package' | 'verification' | 'companion' | 'replanning' | 'dossier' | 'safety' | 'offline';
  intensity?: 'subtle' | 'medium' | 'high';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'home',
  intensity = 'medium',
}) => {
  const { darkMode, reduceAnimations, activeDisruption } = useTripStore();

  if (reduceAnimations) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#F5F8FC] dark:bg-[#071427] transition-colors duration-500" />
    );
  }

  // Variant specific glows
  const isReplanningRain = variant === 'replanning' && (activeDisruption === 'rain' || !activeDisruption);
  const isSafety = variant === 'safety';

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#F5F8FC] dark:bg-[#071427] transition-colors duration-700">
      {/* Light mode base gradient & drifting clouds */}
      {!darkMode ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-orange-50/30" />
          {/* Drifting translucent clouds */}
          <div className="absolute top-10 left-[-10%] w-[500px] h-[180px] rounded-full bg-white/40 blur-3xl animate-pulse duration-[12000ms]" />
          <div className="absolute top-48 right-[-15%] w-[600px] h-[220px] rounded-full bg-sky-100/50 blur-3xl animate-pulse duration-[18000ms]" />
          <div className="absolute bottom-20 left-[20%] w-[450px] h-[150px] rounded-full bg-orange-100/30 blur-2xl animate-pulse duration-[14000ms]" />
        </>
      ) : (
        <>
          {/* Dark mode Aurora blobs */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#071427] via-[#0B1F3A] to-[#071427]" />
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#14B8A6]/10 blur-[130px] animate-pulse duration-[20000ms]" />
          <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] rounded-full bg-[#FF7A1A]/12 blur-[140px] animate-pulse duration-[24000ms]" />
          <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] rounded-full bg-[#0B1F3A]/60 blur-[120px]" />

          {/* Twinkling stars */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[12%] left-[18%] w-1 h-1 rounded-full bg-white animate-ping duration-[3500ms]" />
            <div className="absolute top-[28%] left-[75%] w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse duration-[2800ms]" />
            <div className="absolute top-[65%] left-[12%] w-1 h-1 rounded-full bg-amber-200 animate-ping duration-[4200ms]" />
            <div className="absolute top-[48%] left-[88%] w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse duration-[3100ms]" />
            <div className="absolute top-[82%] left-[45%] w-1 h-1 rounded-full bg-white animate-ping duration-[5000ms]" />
          </div>

          {/* Faint Latitude/Longitude Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </>
      )}

      {/* Variant-specific reactions */}
      {isReplanningRain && (
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-0 left-1/4 w-0.5 h-16 bg-blue-400 rotate-12 animate-pulse" />
          <div className="absolute top-20 left-1/2 w-0.5 h-20 bg-blue-300 rotate-12 animate-pulse" />
          <div className="absolute top-10 right-1/4 w-0.5 h-16 bg-blue-400 rotate-12 animate-pulse" />
        </div>
      )}

      {isSafety && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full border border-red-500/10 animate-ping duration-[3000ms]" />
          <div className="w-[800px] h-[800px] rounded-full border border-red-500/5 animate-ping duration-[4500ms]" />
        </div>
      )}

      {/* Hero plane silhouette drifting across upper hero */}
      <div
        className="absolute top-16 left-[-100px] opacity-15 dark:opacity-20 pointer-events-none"
        style={{
          animation: 'slowDriftPlane 38s linear infinite',
        }}
      >
        <svg className="w-8 h-8 text-[#FF7A1A]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>

      <style>{`
        @keyframes slowDriftPlane {
          0% {
            transform: translateX(-100px) translateY(20px) rotate(5deg);
          }
          50% {
            transform: translateX(55vw) translateY(-10px) rotate(8deg);
          }
          100% {
            transform: translateX(115vw) translateY(-30px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
};
