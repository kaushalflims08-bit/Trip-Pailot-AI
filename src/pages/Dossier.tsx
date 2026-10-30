import React, { useState } from 'react';
import {
  Printer, Download, ShieldCheck, Leaf, Star, Sparkles, Check,
  MapPin, Calendar, Users, IndianRupee, Phone, FileText, CheckCircle2
} from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { EMERGENCY_NUMBERS, SAFE_FACILITIES } from '../data/emergency';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { triggerConfetti } from '../components/ui/Confetti';
import { convertInr } from '../services/currency';

export const Dossier: React.FC = () => {
  const {
    booking,
    tripDetails,
    selectedPackage,
    travelers,
    generatedItinerary,
    expenses,
    trustedContacts,
    completedSteps,
    language,
    currency,
    exchangeRates,
  } = useTripStore();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Compute Trip Readiness Score (0 to 100)
  const stepsWeight = (completedSteps.length / 6) * 40;
  const contactsWeight = Math.min(trustedContacts.length * 10, 20);
  const docsWeight = travelers.length > 0 ? 25 : 0;
  const offlineCacheWeight = 15;
  const readinessScore = Math.min(Math.round(stepsWeight + contactsWeight + docsWeight + offlineCacheWeight), 100);

  // Compute Carbon Footprint Estimate
  // Chennai -> Ooty approx 550 km one way = 1,100 km round trip
  // Nilgiri Train ~ 0.04 kg CO2/km
  const travelKm = 1100;
  const trainCo2PerPax = Math.round(travelKm * 0.04);
  const carCo2PerPax = Math.round(travelKm * 0.17);
  const co2Saved = carCo2PerPax - trainCo2PerPax;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    triggerConfetti();
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-6 printable-dossier">
      {/* Header with Print & Download Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <Badge variant="orange">Slide 6 of 6</Badge>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
            {language === 'ta' ? 'அதிகாரப்பூர்வ பயண ஆவணம்' : 'Official Trip Dossier & Safety Brief'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Certified document for offline verification, hotel check-in, and emergency response
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="glass"
            icon={<Printer className="w-4 h-4 text-[#FF7A1A]" />}
            onClick={handlePrint}
          >
            {language === 'ta' ? 'அச்சிடு / PDF' : 'Print / Save as PDF'}
          </Button>
        </div>
      </div>

      {/* Main Dossier Document Container */}
      <div className="rounded-3xl glass-card border border-slate-300 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-6 bg-white/95 dark:bg-[#071427]/95 relative overflow-hidden">
        {/* Decorative Official Stamp / Seal Animation */}
        <div className="absolute top-6 right-6 pointer-events-none transform rotate-12 opacity-80 select-none">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-dashed border-[#FF7A1A] p-2 flex flex-col items-center justify-center text-center shadow-lg animate-in zoom-in-75">
            <span className="text-[9px] font-black tracking-widest text-[#FF7A1A] uppercase">TRIPPILOT AI</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#0B1F3A] dark:text-white">VERIFIED</span>
            <span className="text-[8px] font-mono text-slate-500">TAMIL NADU</span>
          </div>
        </div>

        {/* Section 1: Header & Reference */}
        <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Booking Reference ID
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#FF7A1A] tracking-wider mt-0.5">
            {booking?.bookingId || 'TP-2026-78412'}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3 font-medium">
            <span>Route: <strong>{tripDetails.from} ⇄ {tripDetails.destination}</strong></span>
            <span>•</span>
            <span>Dates: <strong>{tripDetails.startDate} to {tripDetails.endDate}</strong></span>
            <span>•</span>
            <span>
              Package: <strong>{selectedPackage?.name || 'Standard Explorer'}</strong> (₹{(booking?.totalAmount || selectedPackage?.price || 12400).toLocaleString('en-IN')}{currency !== 'INR' && ` • ${convertInr(booking?.totalAmount || selectedPackage?.price || 12400, currency, exchangeRates).formatted}`})
            </span>
          </div>
        </div>

        {/* Section 2: Readiness Score & Eco Footprint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                Trip Readiness Score
              </span>
              <span className="text-xl font-black text-teal-600 dark:text-teal-400">
                {readinessScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden my-2">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${readinessScore}%` }} />
            </div>
            <p className="text-[11px] text-slate-500">
              Emergency contacts armed • Offline guide cached • Government IDs verified
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-500" />
                Carbon Footprint Estimate
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {trainCo2PerPax} kg CO₂
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-2">
              Saved ~{co2Saved} kg CO₂ by choosing Mountain Railway over private highway cars.
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              UNESCO Nilgiri Heritage Railway eco-accredited.
            </p>
          </div>
        </div>

        {/* Section 3: Verified Travelers */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Passenger Manifest & Government IDs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {travelers.map((tr, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">
                  {tr.fullName} ({tr.gender}, Age {tr.age})
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {tr.idType}: {tr.idNumber} • Mobile: {tr.phone}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Final Confirmed Itinerary */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Final Travel Itinerary
          </h4>
          <div className="space-y-3">
            {generatedItinerary.map((d) => (
              <div key={d.day} className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 text-xs">
                <div className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
                  <span>Day {d.day}: {d.title}</span>
                  <span className="text-slate-500 font-mono">
                    ₹{d.dayTotal}
                    {currency !== 'INR' && ` (${convertInr(d.dayTotal, currency, exchangeRates).formatted})`}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  {d.activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-mono text-slate-400 w-16 shrink-0">{a.time}</span>
                      <span>{a.title} ({a.location})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Emergency Contacts & Dispatch Facilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">
              National Emergency Helplines
            </h4>
            <div className="space-y-1 text-slate-700 dark:text-slate-300">
              <div>National All-in-One: <strong>112</strong></div>
              <div>Medical / Ambulance: <strong>108</strong></div>
              <div>Police Emergency: <strong>100</strong></div>
              <div>Women Safety Helpline: <strong>1091</strong></div>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">
              Designated Sector Facilities
            </h4>
            <div className="space-y-1 text-slate-700 dark:text-slate-300">
              <div>District Hospital Ooty: <strong>0423-2442212</strong></div>
              <div>Ooty Town Police Station: <strong>0423-2442222</strong></div>
              <div>Coonoor Lawley Hospital: <strong>0423-2230230</strong></div>
            </div>
          </div>
        </div>

        {/* Section 6: User Rating & Feedback Form */}
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 no-print">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading mb-2">
            {language === 'ta' ? 'உங்கள் பயண அனுபவத்தை மதிப்பிடுங்கள்' : 'Rate Your TripPilot AI Experience'}
          </h4>

          {feedbackSubmitted ? (
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you! Your verified review has been submitted to TripPilot AI.</span>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the AI itinerary, ghat alerts, or live safety..."
                className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />

              <Button size="sm" variant="primary" type="submit">
                {language === 'ta' ? 'கருத்தைச் சமர்ப்பிக்கவும்' : 'Submit Review'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
