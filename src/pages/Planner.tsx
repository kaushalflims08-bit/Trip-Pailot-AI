import React, { useState } from 'react';
import {
  Sparkles, Mic, Calendar, Users, IndianRupee, MapPin, ArrowRight,
  CheckCircle2, Compass, Car, Hotel, AlertCircle, Clock
} from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { destinations } from '../data/destinations';
import { tripModes } from '../data/tripModeRules';
import { generateTripPlan } from '../services/gemini';
import { generatePackagesForBudget } from '../services/mockData';
import { convertInr } from '../services/currency';
import { CurrencySelector } from '../components/layout/CurrencySelector';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge, DemoBadge } from '../components/ui/Badge';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

export const Planner: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const {
    tripDetails,
    setTripDetails,
    selectedTripMode,
    setSelectedTripMode,
    generatedItinerary,
    setGeneratedItinerary,
    markStepCompleted,
    language,
    currency,
    exchangeRates,
  } = useTripStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isTypingAutofill, setIsTypingAutofill] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  // Form State
  const [from, setFrom] = useState(tripDetails.from || 'Chennai');
  const [destination, setDestination] = useState(tripDetails.destination || 'Ooty');
  const [startDate, setStartDate] = useState(tripDetails.startDate || '2026-11-06');
  const [endDate, setEndDate] = useState(tripDetails.endDate || '2026-11-08');
  const [travelers, setTravelers] = useState(tripDetails.travelers || 2);
  const [budget, setBudget] = useState(tripDetails.budget || 15000);
  const [travelStyle, setTravelStyle] = useState(tripDetails.travelStyle || 'Nature & Relaxed');
  const [transport, setTransport] = useState(tripDetails.transport || 'Train + Road');
  const [stay, setStay] = useState(tripDetails.stayPreference || 'Budget hotel/homestay');
  const [pace, setPace] = useState<'relaxed' | 'balanced' | 'packed'>(tripDetails.pace || 'balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    tripDetails.interests || ['Tea Estates', 'Toy Train', 'Local Food', 'Viewpoints']
  );

  const interestOptions = [
    'Tea Estates', 'Toy Train', 'Waterfalls', 'Local Food', 'Viewpoints',
    'Boating', 'Wildlife', 'Temples', 'Photography', 'Heritage'
  ];

  // Validation
  const isFormValid =
    from.trim().length >= 2 &&
    destination.trim().length >= 2 &&
    startDate &&
    endDate &&
    travelers >= 1 &&
    budget >= 2000;

  // AI Auto-Fill Simulation
  const handleAiAutofill = async () => {
    setIsTypingAutofill(true);

    // Typing simulation helper
    const typeInto = async (setter: (val: any) => void, text: string) => {
      let current = '';
      for (let i = 0; i < text.length; i++) {
        current += text[i];
        setter(current);
        await new Promise((r) => setTimeout(r, 25));
      }
    };

    await typeInto(setFrom, 'Chennai');
    await typeInto(setDestination, 'Ooty');
    setStartDate('2026-11-06');
    setEndDate('2026-11-08');
    setTravelers(2);
    setBudget(15000);
    setTransport('Train + Road');
    setStay('Budget hotel/homestay');
    setSelectedInterests(['Tea Estates', 'Toy Train', 'Local Food', 'Viewpoints']);
    setIsTypingAutofill(false);
  };

  const handleGeneratePlan = async () => {
    if (!isFormValid) return;
    setIsLoading(true);

    try {
      const result = await generateTripPlan({
        from,
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        travelStyle,
        interests: selectedInterests,
        transport,
        stay,
        pace,
        tripMode: selectedTripMode,
        language,
      });

      setGeneratedItinerary(result.days);
      setIsDemoData(result.isDemoFallback);

      // Save to store
      setTripDetails({
        from,
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        travelStyle,
        interests: selectedInterests,
        transport,
        stayPreference: stay,
        pace,
      });
    } catch {
      // fallback handled inside service
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishStep = () => {
    // Generate package options scaled to this budget
    const updatedPackages = generatePackagesForBudget(budget);
    useTripStore.setState({ packageOptions: updatedPackages, selectedPackage: updatedPackages[1] });
    markStepCompleted(1);
    onFinish();
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="orange">Slide 1 of 6</Badge>
            {isDemoData && <DemoBadge />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
            {language === 'ta' ? 'AI பயணத் திட்டமிடுபவர்' : 'Smart AI Trip Planner'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Customize dates, budget, and travel preferences to generate your tailored itinerary
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CurrencySelector compact />
          <Button
            size="sm"
            variant="glass"
            icon={<Sparkles className="w-4 h-4 text-[#FF7A1A]" />}
            isLoading={isTypingAutofill}
            onClick={handleAiAutofill}
          >
            {language === 'ta' ? 'AI தானாக நிரப்பு' : 'Auto-fill with AI (Demo)'}
          </Button>
        </div>
      </div>

      {/* Main Input Form */}
      <GlassCard className="p-5 sm:p-6 space-y-5">
        {/* Row 1: From & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={language === 'ta' ? 'புறப்படும் இடம்' : 'Starting From'}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="e.g. Chennai"
            leftIcon={<MapPin className="w-4 h-4" />}
            isValid={from.trim().length >= 2}
            required
          />

          <div className="relative">
            <Input
              label={language === 'ta' ? 'சேருமிடம்' : 'Destination'}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Ooty"
              leftIcon={<MapPin className="w-4 h-4 text-[#FF7A1A]" />}
              isValid={destination.trim().length >= 2}
              required
            />
          </div>
        </div>

        {/* Row 2: Dates, Travelers, Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            label={language === 'ta' ? 'தொடக்க தேதி' : 'Start Date'}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            isValid={!!startDate}
            required
          />
          <Input
            label={language === 'ta' ? 'முடிவு தேதி' : 'End Date'}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            isValid={!!endDate}
            required
          />
          <Input
            label={language === 'ta' ? 'பயணிகள்' : 'Travelers'}
            type="number"
            min={1}
            max={20}
            value={travelers}
            onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
            leftIcon={<Users className="w-4 h-4" />}
            isValid={travelers >= 1}
            required
          />
          <div>
            <Input
              label={language === 'ta' ? 'பட்ஜெட் (₹)' : 'Budget (₹)'}
              type="number"
              step={500}
              min={2000}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value) || 5000)}
              leftIcon={<IndianRupee className="w-4 h-4 text-emerald-500" />}
              isValid={budget >= 2000}
              required
            />
            {currency !== 'INR' && (
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-between px-1">
                <span>≈ {convertInr(budget, currency, exchangeRates).formatted}</span>
                <span className="text-[10px] text-slate-400 font-mono">1 INR = {exchangeRates[currency]?.toFixed(4)} {currency}</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Transport & Stay Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Transport Mode
            </label>
            <select
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
              className="w-full rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 min-h-[44px]"
            >
              <option value="Train + Road">Train + Local Road Taxi (Recommended)</option>
              <option value="Direct Private Cab">Direct Private Cab (Door-to-Door)</option>
              <option value="State AC Bus">State AC Bus + Local Cab</option>
              <option value="Flight + Cab">Flight to Coimbatore + Cab</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Stay Style
            </label>
            <select
              value={stay}
              onChange={(e) => setStay(e.target.value)}
              className="w-full rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 min-h-[44px]"
            >
              <option value="Budget hotel/homestay">Budget Mountain Homestay (₹1,500 - ₹2,500)</option>
              <option value="3-Star Nilgiri Valley Resort">3-Star Valley Resort with Breakfast</option>
              <option value="4-Star Colonial Estate">4-Star Heritage Estate (Luxury)</option>
              <option value="Backpacker Hostel">Backpacker Hostel Dorm (₹800 - ₹1,200)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Travel Pace
            </label>
            <div className="flex gap-2">
              {(['relaxed', 'balanced', 'packed'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPace(p)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer min-h-[44px] ${
                    pace === p
                      ? 'bg-[#FF7A1A] text-white shadow-sm'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interests Chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Interests & Highlights
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((item) => {
              const active = selectedInterests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSelectedInterests(
                      active
                        ? selectedInterests.filter((i) => i !== item)
                        : [...selectedInterests, item]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF7A1A] text-white shadow-sm'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#FF7A1A]/10'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan Generator Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            isLoading={isLoading}
            onClick={handleGeneratePlan}
            disabled={!isFormValid}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {language === 'ta' ? 'பயண அட்டவணையை உருவாக்கு' : 'Generate AI Itinerary'}
          </Button>
        </div>
      </GlassCard>

      {/* Generated Itinerary Preview */}
      {isLoading ? (
        <GlassCard className="p-6">
          <SkeletonLoader lines={6} height="h-6" />
        </GlassCard>
      ) : generatedItinerary && generatedItinerary.length > 0 ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#FF7A1A]" />
              <span>Day-Wise Curated Itinerary</span>
            </h3>
            <span className="text-xs text-slate-500">
              Total Days: {generatedItinerary.length}
            </span>
          </div>

          <div className="space-y-4">
            {generatedItinerary.map((dayItem) => (
              <GlassCard key={dayItem.day} className="p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#0B1F3A] text-white text-xs font-extrabold flex items-center justify-center">
                      D{dayItem.day}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {language === 'ta' && dayItem.titleTa ? dayItem.titleTa : dayItem.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{dayItem.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="teal">Est. ₹{dayItem.dayTotal.toLocaleString('en-IN')}</Badge>
                    {currency !== 'INR' && (
                      <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        ≈ {convertInr(dayItem.dayTotal, currency, exchangeRates).formatted}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {dayItem.activities.map((act, aIdx) => (
                    <div
                      key={aIdx}
                      className="flex items-start justify-between p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-xs gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono font-bold text-slate-500 shrink-0 w-16">
                          {act.time}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {language === 'ta' && act.titleTa ? act.titleTa : act.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {language === 'ta' && act.notesTa ? act.notesTa : act.notes}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          ₹{act.estCost}
                        </span>
                        {currency !== 'INR' && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                            ≈ {convertInr(act.estCost, currency, exchangeRates).formatted}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Glowing Finish Button fades in when valid */}
          <div className="pt-4 flex justify-center pb-6">
            <button
              onClick={handleFinishStep}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-amber-500 to-[#FF7A1A] text-white font-extrabold text-base shadow-2xl shadow-[#FF7A1A]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <span>{language === 'ta' ? 'முடித்து தொகுப்பு தேர்வுக்குச் செல்' : 'Finish & Choose Package'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
