import React, { useState, useEffect } from 'react';
import { Check, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { PackageOption } from '../services/mockData';
import { recommendPackage } from '../services/gemini';
import { convertInr } from '../services/currency';
import { CurrencySelector } from '../components/layout/CurrencySelector';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge, DemoBadge } from '../components/ui/Badge';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

export const PackagePage: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const {
    packageOptions,
    selectedPackage,
    setSelectedPackage,
    tripDetails,
    selectedTripMode,
    language,
    currency,
    exchangeRates,
    markStepCompleted,
  } = useTripStore();

  const [recommendedId, setRecommendedId] = useState('standard');
  const [recommendReason, setRecommendReason] = useState(
    'Standard Explorer is the optimal balance for your ₹15,000 budget with confirmed heritage train seats and private cab.'
  );
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    async function checkRec() {
      setIsAiLoading(true);
      try {
        const res = await recommendPackage(
          packageOptions,
          tripDetails.budget,
          selectedTripMode,
          language
        );
        setRecommendedId(res.recommendedId);
        setRecommendReason(language === 'ta' ? res.reasonTa : res.reason);
      } catch {
        // fallback to standard
      } finally {
        setIsAiLoading(false);
      }
    }
    checkRec();
  }, [tripDetails.budget, selectedTripMode, language]);

  const handleSelect = (pkg: PackageOption) => {
    setSelectedPackage(pkg);
  };

  const handleFinish = () => {
    markStepCompleted(2);
    onFinish();
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-6">
      {/* Title & Currency Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge variant="orange">Slide 2 of 6</Badge>
            {currency !== 'INR' && (
              <Badge variant="teal">Showing {currency} live prices</Badge>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
            {language === 'ta' ? 'சுற்றுலா தொகுப்பைத் தேர்வு செய்க' : 'Select Your Ideal Package'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Transparent all-inclusive rates tailored for your {tripDetails.destination} journey
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CurrencySelector compact />
        </div>
      </div>

      {/* Recommended Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF7A1A]/15 to-amber-500/10 border border-[#FF7A1A]/30 flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#FF7A1A] shrink-0" />
          <span>
            <strong>AI Recommendation:</strong> {recommendReason}
          </span>
        </div>
        <Badge variant="orange" size="sm">
          Gemini Curated
        </Badge>
      </div>

      {/* 4 Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {packageOptions.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;
          const isRecommended = pkg.id === recommendedId;
          const isOverBudget = pkg.price > tripDetails.budget;
          const overAmount = pkg.price - tripDetails.budget;

          return (
            <div
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'glass-card border-2 border-[#FF7A1A] shadow-2xl shadow-[#FF7A1A]/20 scale-[1.02] bg-white/90 dark:bg-[#0B1F3A]/90'
                  : 'glass-card hover:border-slate-400 dark:hover:border-slate-600 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-1 mb-3">
                {isRecommended ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF7A1A] text-white flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-white" />
                    Best For You
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {pkg.id}
                  </span>
                )}

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#FF7A1A] text-white flex items-center justify-center shadow-md animate-in zoom-in-75">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Package Name & Price */}
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white leading-snug">
                  {language === 'ta' ? pkg.nameTa : pkg.name}
                </h3>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">/ 2 travelers</span>
                  </div>
                  {currency !== 'INR' && (
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <span>≈ {convertInr(pkg.price, currency, exchangeRates).formatted}</span>
                      <span className="text-[10px] text-slate-400">({currency})</span>
                    </div>
                  )}
                </div>

                {isOverBudget && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    <AlertTriangle className="w-3 h-3" />
                    <span>
                      Over budget by ₹{overAmount.toLocaleString('en-IN')}
                      {currency !== 'INR' && ` (≈ ${convertInr(overAmount, currency, exchangeRates).formatted})`}
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {language === 'ta' ? pkg.suitabilityTa : pkg.suitability}
                </p>

                {/* Inclusions summary */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider text-slate-400">
                      Transport
                    </strong>
                    {language === 'ta' ? pkg.transportTa : pkg.transport}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider text-slate-400">
                      Stay & Meals
                    </strong>
                    {language === 'ta' ? pkg.hotelTa : pkg.hotel}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider text-slate-400">
                      Cancellation
                    </strong>
                    {language === 'ta' ? pkg.cancellationTa : pkg.cancellation}
                  </div>
                </div>

                {/* Features Checkmarks */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-1.5">
                  {(language === 'ta' ? pkg.featuresTa : pkg.features).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <button
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF7A1A] text-white shadow-md shadow-[#FF7A1A]/30'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#FF7A1A]/10'
                }`}
              >
                {isSelected ? 'Selected' : 'Select Package'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar with Price Counter & Finish to Verification */}
      {selectedPackage && (
        <div className="sticky bottom-4 z-20 flex justify-center animate-in slide-in-from-bottom-6 duration-300">
          <div className="glass-card border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl p-4 sm:px-8 flex items-center justify-between gap-6 max-w-xl w-full bg-white/95 dark:bg-[#071427]/95">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selected: {selectedPackage.name}
              </span>
              <div className="flex items-baseline gap-2">
                <div className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white">
                  <AnimatedCounter value={selectedPackage.price} prefix="₹" />
                </div>
                {currency !== 'INR' && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ≈ {convertInr(selectedPackage.price, currency, exchangeRates).formatted}
                  </span>
                )}
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleFinish}
              className="shadow-lg shadow-[#FF7A1A]/40"
            >
              {language === 'ta' ? 'முடித்து சரிபார்ப்புக்குச் செல்' : 'Finish to Verification'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
