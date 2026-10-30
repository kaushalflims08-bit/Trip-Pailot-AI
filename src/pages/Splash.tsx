import React, { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Globe3D } from '../components/three/Globe3D';
import { LanguageSelector } from '../components/layout/LanguageSelector';

export const Splash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { language, reduceAnimations, setSplashSeen } = useTripStore();
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (reduceAnimations) {
      setSplashSeen(true);
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinish();
          return 100;
        }
        return prev + 3;
      });
    }, 90); // ~3.0s total

    return () => clearInterval(interval);
  }, [reduceAnimations]);

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      setSplashSeen(true);
      onComplete();
    }, 500);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#071427] text-white transition-transform duration-500 ease-in-out ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Top Bar with Language and Skip */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <LanguageSelector compact />
        <button
          onClick={handleFinish}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 transition-all cursor-pointer"
        >
          {language === 'ta' ? 'தவிர் (Skip)' : 'Skip'}
        </button>
      </div>

      {/* Center 3D Globe & Cinematic Title */}
      <div className="flex flex-col items-center text-center max-w-md my-auto">
        <div className="relative mb-6">
          <Globe3D size={280} highlightIndia />
        </div>

        {/* Logo and Pulse */}
        <div className="flex items-center gap-2 mb-2 animate-in zoom-in-90 duration-500">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B1F3A] to-[#FF7A1A] flex items-center justify-center text-white shadow-lg shadow-[#FF7A1A]/40">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading">
            TripPilot<span className="text-[#FF7A1A]">AI</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-sm text-slate-300 font-medium mb-4">
          {language === 'ta'
            ? 'திட்டமிடுங்கள் • பயணியுங்கள் • மறுதிட்டமிடுங்கள் • பாதுகாப்பாக இருங்கள்'
            : 'Plan • Travel • Replan • Stay Safe'}
        </p>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#FF7A1A] to-[#14B8A6] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">
        Intelligent Indian Travel Companion
      </div>
    </div>
  );
};
