import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Lock } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Planner } from './Planner';
import { PackagePage } from './Package';
import { Verification } from './Verification';
import { Companion } from './Companion';
import { Replanning } from './Replanning';
import { Dossier } from './Dossier';

interface SlideshowWrapperProps {
  onStartTripClick: () => void;
  onFinishTripClick: () => void;
}

export const SlideshowWrapper: React.FC<SlideshowWrapperProps> = ({
  onStartTripClick,
  onFinishTripClick,
}) => {
  const {
    currentStep,
    setCurrentStep,
    completedSteps,
    reduceAnimations,
  } = useTripStore();

  const isWheelLockedRef = useRef(false);

  const stepLabels = [
    { id: 1, label: 'Planner' },
    { id: 2, label: 'Package' },
    { id: 3, label: 'Verification' },
    { id: 4, label: 'Live Companion' },
    { id: 5, label: 'Replanning' },
    { id: 6, label: 'Dossier' },
  ];

  const canNavigateTo = (step: number) => {
    if (step <= currentStep) return true;
    if (step === currentStep + 1 && completedSteps.includes(currentStep)) return true;
    if (completedSteps.includes(step - 1)) return true;
    return false;
  };

  const handleStepClick = (step: number) => {
    if (canNavigateTo(step)) {
      setCurrentStep(step);
    }
  };

  // Keyboard navigation (ArrowUp, ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentStep < 6 && canNavigateTo(currentStep + 1)) {
          setCurrentStep(currentStep + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, completedSteps]);

  // Mouse wheel navigation with strict guard against scrollable children and maps
  const handleWheel = (e: React.WheelEvent) => {
    const target = e.target as HTMLElement;
    // Guard against hijacking scroll inside cards, maps, or input areas
    if (
      target.closest('.leaflet-container') ||
      target.closest('.overflow-y-auto') ||
      target.closest('textarea') ||
      target.closest('input')
    ) {
      return;
    }

    if (isWheelLockedRef.current) return;

    if (e.deltaY > 50) {
      if (currentStep < 6 && canNavigateTo(currentStep + 1)) {
        isWheelLockedRef.current = true;
        setCurrentStep(currentStep + 1);
        setTimeout(() => (isWheelLockedRef.current = false), 750);
      }
    } else if (e.deltaY < -50) {
      if (currentStep > 1) {
        isWheelLockedRef.current = true;
        setCurrentStep(currentStep - 1);
        setTimeout(() => (isWheelLockedRef.current = false), 750);
      }
    }
  };

  const renderCurrentSlide = () => {
    switch (currentStep) {
      case 1:
        return <Planner onFinish={() => setCurrentStep(2)} />;
      case 2:
        return <PackagePage onFinish={() => setCurrentStep(3)} />;
      case 3:
        return (
          <Verification
            onContinue={() => setCurrentStep(4)}
            onViewDossier={() => setCurrentStep(6)}
          />
        );
      case 4:
        return (
          <Companion
            onStartTripClick={onStartTripClick}
            onFinishTripClick={onFinishTripClick}
            onNavigateSlide={(s) => setCurrentStep(s)}
          />
        );
      case 5:
        return <Replanning onFinish={() => setCurrentStep(6)} />;
      case 6:
        return <Dossier />;
      default:
        return <Planner onFinish={() => setCurrentStep(2)} />;
    }
  };

  return (
    <div
      onWheel={handleWheel}
      className="relative w-full h-[calc(100dvh-64px)] overflow-hidden flex flex-col"
    >
      {/* Compact Top Stepper for Mobile */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Step {currentStep} of 6: <span className="text-[#FF7A1A]">{stepLabels[currentStep - 1]?.label}</span>
        </span>
        <div className="flex gap-1.5">
          {stepLabels.map((s) => (
            <span
              key={s.id}
              className={`w-2.5 h-2.5 rounded-full ${
                s.id === currentStep
                  ? 'bg-[#FF7A1A] ring-2 ring-[#FF7A1A]/30'
                  : completedSteps.includes(s.id)
                  ? 'bg-teal-500'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Animated Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: reduceAnimations ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceAnimations ? 0 : -30 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {renderCurrentSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Vertical Right Stepper (Dots + Tooltips) */}
      <div className="hidden lg:flex fixed right-6 top-1/2 transform -translate-y-1/2 flex-col gap-3.5 z-30">
        {stepLabels.map((s) => {
          const isActive = currentStep === s.id;
          const isDone = completedSteps.includes(s.id);
          const isLocked = !canNavigateTo(s.id);

          return (
            <button
              key={s.id}
              onClick={() => handleStepClick(s.id)}
              disabled={isLocked}
              title={isLocked ? 'Complete the previous step first' : s.label}
              className="group flex items-center gap-3 focus:outline-none cursor-pointer"
            >
              {/* Tooltip Label on Hover */}
              <span
                className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold px-2 py-0.5 rounded-md glass-card whitespace-nowrap ${
                  isActive ? 'text-[#FF7A1A]' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {s.label}
              </span>

              {/* Dot Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#FF7A1A] text-white ring-4 ring-[#FF7A1A]/20 scale-110 shadow-md shadow-[#FF7A1A]/30'
                    : isDone
                    ? 'bg-teal-500 text-white shadow-sm'
                    : isLocked
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 hover:scale-105'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <span className="text-[10px] font-bold">{s.id}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
