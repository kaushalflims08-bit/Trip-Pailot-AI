import React, { useEffect } from 'react';
import { Train, Plane, Car, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { triggerConfetti } from '../ui/Confetti';
import { Button } from '../ui/Button';

export const TripStartOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tripDetails, selectedPackage, language, startTrip } = useTripStore();

  useEffect(() => {
    startTrip();
    triggerConfetti();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071427]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-lg w-full glass-card border border-teal-500/30 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        {/* Animated Vehicle Header */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping duration-[2500ms]" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0B1F3A] to-[#14B8A6] flex items-center justify-center text-white shadow-xl">
            <Train className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Live Journey Started
        </span>

        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            {language === 'ta' ? 'உங்கள் பயணம் தொடங்கியது!' : 'Your Trip Has Started!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {tripDetails.from} ⇄ {tripDetails.destination} • 3 Days Nature & Ghat Adventure
          </p>
        </div>

        {/* Animated Route Line Mock */}
        <div className="relative py-4 px-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
            <span>{tripDetails.from} Central</span>
            <span className="text-[#FF7A1A]">Mettupalayam (Ghats)</span>
            <span className="text-teal-400">{tripDetails.destination}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
            <div className="bg-gradient-to-r from-[#FF7A1A] via-teal-400 to-emerald-400 h-full w-2/3 animate-pulse" />
          </div>
        </div>

        {/* Details Summary */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 block">Package</span>
            <strong className="text-white">{selectedPackage?.name || 'Standard'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Travelers</span>
            <strong className="text-white">{tripDetails.travelers} Pax</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Safety Mode</span>
            <strong className="text-teal-400">Armed (24/7)</strong>
          </div>
        </div>

        <Button
          size="lg"
          variant="primary"
          icon={<ArrowRight className="w-5 h-5" />}
          onClick={onClose}
          className="w-full shadow-lg shadow-[#FF7A1A]/35"
        >
          {language === 'ta' ? 'நேரலை டாஷ்போர்டுக்குச் செல்' : 'Enter Live Cockpit'}
        </Button>
      </div>
    </div>
  );
};
