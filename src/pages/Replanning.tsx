import React, { useState } from 'react';
import {
  RefreshCw, CloudRain, Clock, AlertTriangle, ShieldCheck,
  Building, IndianRupee, ArrowRight, Share2, Sparkles, Check, CheckCircle2
} from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { replanItinerary, ReplanResult } from '../services/gemini';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge, DemoBadge } from '../components/ui/Badge';
import { Weather3D } from '../components/three/Weather3D';
import { triggerConfetti } from '../components/ui/Confetti';

export const Replanning: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const {
    tripDetails,
    generatedItinerary,
    setGeneratedItinerary,
    expenses,
    activeDisruption,
    setActiveDisruption,
    addReplanningRecord,
    addNotification,
    language,
    markStepCompleted,
  } = useTripStore();

  const [selectedDisruption, setSelectedDisruption] = useState('rain');
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanData, setReplanData] = useState<ReplanResult | null>(null);
  const [isPlanAccepted, setIsPlanAccepted] = useState(false);

  const disruptions = [
    { id: 'rain', label: 'Heavy Rain / Landslide Alert', icon: CloudRain, severity: 'High' },
    { id: 'delay', label: 'Nilgiri Express 3-Hr Delay', icon: Clock, severity: 'Medium' },
    { id: 'roadBlocked', label: 'Kallar Ghat 14th Hairpin Diversion', icon: AlertTriangle, severity: 'High' },
    { id: 'closed', label: 'Botanical Garden Closed for VIP Visit', icon: Building, severity: 'Low' },
    { id: 'budget', label: 'Budget Exceeded (₹2,000+)', icon: IndianRupee, severity: 'Medium' },
  ];

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = tripDetails.budget - totalSpent;

  const handleExecuteReplan = async (disruptionIdToRun?: string) => {
    const dId = disruptionIdToRun || selectedDisruption;
    setIsReplanning(true);
    setActiveDisruption(dId);
    setIsPlanAccepted(false);

    try {
      const match = disruptions.find((d) => d.id === dId);
      const res = await replanItinerary(
        generatedItinerary,
        match?.label || 'Heavy Rain',
        balance,
        language
      );
      setReplanData(res);

      addNotification({
        type: 'disruption',
        title: 'Disruption Detected & Replanned',
        titleTa: 'தடங்கல் கண்டறியப்பட்டு மறுதிட்டமிடப்பட்டது',
        message: res.reason,
        messageTa: res.reasonTa,
      });
    } catch {
      // fallback
    } finally {
      setIsReplanning(false);
    }
  };

  const handleAcceptNewPlan = () => {
    if (!replanData) return;
    setGeneratedItinerary(replanData.revisedDays);
    addReplanningRecord({
      disruption: selectedDisruption,
      timestamp: Date.now(),
      reason: replanData.reason,
      costImpact: replanData.costImpact,
    });
    setIsPlanAccepted(true);
    triggerConfetti();
    markStepCompleted(5);
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge variant="orange">Slide 5 of 6</Badge>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
            {language === 'ta' ? 'தானியங்கி மறுதிட்டமிடல் அமைப்பு' : 'Intelligent Replanning Engine'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Simulate or respond to sudden mountain weather, train delays, or blocked hairpin roads
          </p>
        </div>

        {/* Balance Card */}
        <div className="p-3.5 rounded-2xl glass-card border border-teal-500/30 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Remaining Balance</span>
            <div className="text-lg font-black text-teal-500">
              ₹{balance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Budget</span>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              ₹{tripDetails.budget.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Disruption Selector Buttons */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
          Simulate a Travel Disruption:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {disruptions.map((d) => {
            const Icon = d.icon;
            const isSel = selectedDisruption === d.id;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDisruption(d.id);
                  handleExecuteReplan(d.id);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                  isSel
                    ? 'bg-[#FF7A1A]/10 border-[#FF7A1A] text-[#FF7A1A] shadow-md scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-current" />
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      d.severity === 'High'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    {d.severity}
                  </span>
                </div>
                <div className="text-xs font-bold mt-2 leading-snug">{d.label}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Dynamic 3D Weather Simulation & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Visual Center: Rain cloud turning into Sun after replan */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl glass-card border border-white/20 dark:border-white/10 text-center">
          <Weather3D type={isPlanAccepted ? 'sun' : 'rain'} />
          <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            {isPlanAccepted ? (
              <span className="text-teal-500 font-extrabold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Replanned & Cleared</span>
              </span>
            ) : (
              <span className="text-amber-500 font-bold flex items-center justify-center gap-1">
                <CloudRain className="w-4 h-4 animate-bounce" />
                <span>Simulated Storm Disruption</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isPlanAccepted
              ? 'Warm indoor tea factory & covered museums substituted'
              : 'Outdoor lake boating & peak viewpoints exposed to storm'}
          </p>
        </div>

        {/* Replan Results & Before vs After (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {isReplanning ? (
            <GlassCard className="p-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#FF7A1A] animate-spin mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Gemini AI is replanning your Ooty itinerary...
              </h4>
              <p className="text-xs text-slate-500">
                Swapping slippery viewpoints with verified indoor cultural sights and maintaining safety margins.
              </p>
            </GlassCard>
          ) : replanData ? (
            <GlassCard className="p-6 space-y-4 animate-in fade-in duration-300 border-2 border-teal-500/40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    AI Revised Travel Plan
                  </h4>
                </div>
                <Badge variant="teal">Safety Impact: Positive</Badge>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <p>
                  <strong>Why it changed:</strong>{' '}
                  {language === 'ta' ? replanData.reasonTa : replanData.reason}
                </p>
                <p>
                  <strong>Safety Benefit:</strong>{' '}
                  {language === 'ta' ? replanData.safetyImpactTa : replanData.safetyImpact}
                </p>
                <div className="flex items-center gap-4 pt-1 font-bold text-xs">
                  <span className="text-emerald-500">
                    Cost Impact: {replanData.costImpact <= 0 ? `Saved ₹${Math.abs(replanData.costImpact)}` : `+₹${replanData.costImpact}`}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-teal-400">Zero Outdoor Hazard Exposure</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Check className="w-4 h-4" />}
                    onClick={handleAcceptNewPlan}
                  >
                    {isPlanAccepted ? 'Plan Accepted & Active' : 'Accept New Plan & Update Itinerary'}
                  </Button>

                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => handleExecuteReplan()}
                  >
                    Compare Again
                  </Button>
                </div>

                {isPlanAccepted && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<ArrowRight className="w-4 h-4" />}
                    onClick={onFinish}
                  >
                    Go to Trip Dossier
                  </Button>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 text-center text-xs text-slate-400">
              Tap any disruption scenario above to see Gemini dynamically restructure your trip.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
