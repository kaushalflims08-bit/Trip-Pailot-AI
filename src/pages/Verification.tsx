import React, { useState } from 'react';
import {
  ShieldCheck, CreditCard, Smartphone, Building, Check, ArrowRight,
  FileCheck, Sparkles, Tag, CheckCircle2, Plane, Lock
} from 'lucide-react';
import { useTripStore, TravelerInfo, BookingInfo } from '../store/useTripStore';
import { getActiveOrUpcomingFestival } from '../data/festivals';
import { triggerConfetti } from '../components/ui/Confetti';
import { PlaneFlyAcross } from '../components/ui/PlaneFlyAcross';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { convertInr } from '../services/currency';
import { CurrencySelector } from '../components/layout/CurrencySelector';

export const Verification: React.FC<{
  onContinue: () => void;
  onViewDossier: () => void;
}> = ({ onContinue, onViewDossier }) => {
  const {
    tripDetails,
    selectedPackage,
    travelers,
    setTravelers,
    confirmBooking,
    booking,
    language,
    currency,
    exchangeRates,
  } = useTripStore();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('karthik@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8921 4410 1289');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);
  const [showPlane, setShowPlane] = useState(false);

  // Festival discount
  const festival = getActiveOrUpcomingFestival();
  const pkgPrice = selectedPackage?.price || 12400;
  const discountAmount = Math.round((pkgPrice * festival.discountPercentage) / 100);
  const basePrice = pkgPrice - discountAmount;
  const gstAmount = Math.round(basePrice * 0.05); // 5% GST
  const finalTotal = basePrice + gstAmount;

  // Local traveler state
  const [travelerList, setTravelerList] = useState<TravelerInfo[]>(
    travelers.length > 0
      ? travelers
      : [
          {
            fullName: 'Karthik Subramanian',
            age: 29,
            gender: 'Male',
            phone: '9840123456',
            email: 'karthik.subramanian@example.com',
            idType: 'Aadhaar',
            idNumber: '4821 9081 1234',
            emergencyContact: '9444098765',
          },
        ]
  );

  const handleUpdateTraveler = (index: number, field: keyof TravelerInfo, value: any) => {
    const updated = [...travelerList];
    updated[index] = { ...updated[index], [field]: value };
    setTravelerList(updated);
  };

  const handleConfirm = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccessScreen(true);
      setShowPlane(true);
      triggerConfetti();

      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const generatedId = `TP-2026-${randomDigits}`;

      const bookingRecord: BookingInfo = {
        bookingId: generatedId,
        destination: tripDetails.destination,
        from: tripDetails.from,
        startDate: tripDetails.startDate,
        endDate: tripDetails.endDate,
        travelerCount: travelerList.length,
        package: selectedPackage!,
        totalAmount: finalTotal,
        baseAmount: basePrice,
        gstAmount,
        discountAmount,
        paymentMethod,
        bookedAt: new Date().toISOString(),
      };

      setTravelers(travelerList);
      confirmBooking(bookingRecord);
    }, 2000);
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-6">
      {showPlane && <PlaneFlyAcross />}

      {/* Booking Success Screen */}
      {isSuccessScreen && booking ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 sm:p-10 rounded-3xl glass-card border border-teal-500/40 shadow-2xl animate-in zoom-in-95 duration-500">
          {/* Animated SVG Circle Draw with PathLength Check */}
          <div className="w-24 h-24 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-6 ring-8 ring-teal-500/10">
            <svg className="w-14 h-14" viewBox="0 0 52 52">
              <circle
                className="stroke-teal-500 fill-none"
                cx="26"
                cy="26"
                r="25"
                strokeWidth="2.5"
                style={{
                  strokeDasharray: 166,
                  strokeDashoffset: 166,
                  animation: 'strokeDraw 0.8s ease-in-out forwards',
                }}
              />
              <path
                className="stroke-teal-500 fill-none"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27l8 8 16-16"
                style={{
                  strokeDasharray: 48,
                  strokeDashoffset: 48,
                  animation: 'strokeDraw 0.6s ease-in-out 0.6s forwards',
                }}
              />
            </svg>
            <style>{`
              @keyframes strokeDraw {
                to { stroke-dashoffset: 0; }
              }
            `}</style>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 mb-2">
            Payment Verified & Confirmed
          </span>

          <h2 className="text-2xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
            {language === 'ta' ? 'பதிவு வெற்றிகரமாக முடிந்தது!' : 'Your Trip is Successfully Booked!'}
          </h2>

          <div className="my-5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 max-w-md w-full">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Official Booking ID
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#FF7A1A] mt-1 tracking-wider">
              {booking.bookingId}
            </div>
            <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-around border-t border-slate-200 dark:border-slate-800 pt-2 font-medium">
              <span>{tripDetails.from} → {tripDetails.destination}</span>
              <span>•</span>
              <span>{booking.travelerCount} Travelers</span>
              <span>•</span>
              <span>
                ₹{booking.totalAmount.toLocaleString('en-IN')}
                {currency !== 'INR' && ` (≈ ${convertInr(booking.totalAmount, currency, exchangeRates).formatted})`}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
            All tickets, hotel confirmations, emergency hospital coordinates, and live GPS tracking are armed in your live companion dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              variant="outline"
              icon={<FileCheck className="w-5 h-5 text-[#FF7A1A]" />}
              onClick={onViewDossier}
            >
              {language === 'ta' ? 'பயண ஆவணத்தைப் பார்க்கவும்' : 'View Trip Dossier'}
            </Button>
            <Button
              size="lg"
              variant="primary"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={onContinue}
              className="shadow-xl shadow-[#FF7A1A]/35"
            >
              {language === 'ta' ? 'நேரலை துணைக்குத் தொடரவும்' : 'Continue to Live Companion'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="orange">Slide 3 of 6</Badge>
                {currency !== 'INR' && (
                  <Badge variant="teal">Live Rate: 1 INR = {exchangeRates[currency]?.toFixed(4)} {currency}</Badge>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
                {language === 'ta' ? 'சரிபார்ப்பு மற்றும் முன்பதிவு' : 'Verification & Instant Booking'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Enter government-verified traveler IDs and complete secure checkout
              </p>
            </div>
            <div className="shrink-0">
              <CurrencySelector compact />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Trip & Price Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <GlassCard className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Destination
                    </span>
                    <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white">
                      {tripDetails.from} → {tripDetails.destination}
                    </h3>
                  </div>
                  <Badge variant="teal">{tripDetails.startDate}</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Package:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedPackage?.name}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Base Package Price:</span>
                    <span className="text-right">
                      <div>₹{pkgPrice.toLocaleString('en-IN')}</div>
                      {currency !== 'INR' && (
                        <div className="text-[10px] text-slate-400">≈ {convertInr(pkgPrice, currency, exchangeRates).formatted}</div>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {festival.name} ({festival.code}):
                    </span>
                    <span className="text-right">
                      <div>-₹{discountAmount.toLocaleString('en-IN')}</div>
                      {currency !== 'INR' && (
                        <div className="text-[10px]">≈ -{convertInr(discountAmount, currency, exchangeRates).formatted}</div>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>GST (5% Hospitality):</span>
                    <span className="text-right">
                      <div>+₹{gstAmount.toLocaleString('en-IN')}</div>
                      {currency !== 'INR' && (
                        <div className="text-[10px] text-slate-400">≈ +{convertInr(gstAmount, currency, exchangeRates).formatted}</div>
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Final Total:
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-black font-heading text-[#FF7A1A]">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </div>
                    {currency !== 'INR' && (
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ≈ {convertInr(finalTotal, currency, exchangeRates).formatted} ({currency})
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-700 dark:text-teal-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-teal-500" />
                  <span>Free cancellation up to 24 hrs prior to travel with 100% refund.</span>
                </div>
              </GlassCard>

              {/* Payment Methods */}
              <GlassCard className="p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Select Payment Method
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI Instant', icon: Smartphone },
                    { id: 'Card', label: 'Credit/Debit', icon: CreditCard },
                    { id: 'NetBanking', label: 'Net Banking', icon: Building },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSel = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          isSel
                            ? 'bg-[#FF7A1A]/10 border-[#FF7A1A] text-[#FF7A1A]'
                            : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'UPI' && (
                  <Input
                    label="VPA / UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@okaxis"
                    isValid={upiId.includes('@')}
                  />
                )}

                {paymentMethod === 'Card' && (
                  <Input
                    label="Card Number (Luhn verified demo)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 8921 4410 1289"
                    isValid={cardNumber.replace(/\s/g, '').length === 16}
                  />
                )}
              </GlassCard>
            </div>

            {/* Right Column: Traveler Details Form */}
            <div className="lg:col-span-7 space-y-4">
              <GlassCard className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                    Primary Traveler Form (Govt ID Mandatory)
                  </h3>
                  <span className="text-xs text-slate-400">Traveler 1 of {travelerList.length}</span>
                </div>

                {travelerList.map((tr, index) => (
                  <div key={index} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Full Legal Name"
                        value={tr.fullName}
                        onChange={(e) => handleUpdateTraveler(index, 'fullName', e.target.value)}
                        placeholder="As on Government ID"
                        isValid={tr.fullName.trim().length >= 3}
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Age"
                          type="number"
                          min={1}
                          max={100}
                          value={tr.age}
                          onChange={(e) => handleUpdateTraveler(index, 'age', parseInt(e.target.value) || 18)}
                          isValid={tr.age >= 1 && tr.age <= 100}
                          required
                        />
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                            Gender
                          </label>
                          <select
                            value={tr.gender}
                            onChange={(e) => handleUpdateTraveler(index, 'gender', e.target.value)}
                            className="w-full rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-900 dark:text-white min-h-[44px]"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Mobile Number"
                        value={tr.phone}
                        onChange={(e) => handleUpdateTraveler(index, 'phone', e.target.value)}
                        placeholder="10-digit phone"
                        isValid={tr.phone.replace(/\D/g, '').length >= 10}
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={tr.email}
                        onChange={(e) => handleUpdateTraveler(index, 'email', e.target.value)}
                        placeholder="for booking receipt"
                        isValid={tr.email.includes('@')}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                          ID Type
                        </label>
                        <select
                          value={tr.idType}
                          onChange={(e) => handleUpdateTraveler(index, 'idType', e.target.value)}
                          className="w-full rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-900 dark:text-white min-h-[44px]"
                        >
                          <option>Aadhaar</option>
                          <option>Passport</option>
                          <option>Driving Licence</option>
                        </select>
                      </div>

                      <Input
                        label={`${tr.idType} Number (Masked)`}
                        value={tr.idNumber}
                        onChange={(e) => handleUpdateTraveler(index, 'idNumber', e.target.value)}
                        placeholder="XXXX XXXX 1234"
                        isValid={tr.idNumber.length >= 8}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Emergency Contact Phone"
                        value={tr.emergencyContact || ''}
                        onChange={(e) => handleUpdateTraveler(index, 'emergencyContact', e.target.value)}
                        placeholder="e.g. +91 94440 98765"
                        isValid={!!tr.emergencyContact}
                      />
                      <Input
                        label="Health / Allergy Note (Optional)"
                        value={tr.healthNotes || ''}
                        onChange={(e) => handleUpdateTraveler(index, 'healthNotes', e.target.value)}
                        placeholder="e.g. Motion sickness on ghats"
                      />
                    </div>
                  </div>
                ))}

                {/* Terms and Confirm */}
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 space-y-4">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-[#FF7A1A] focus:ring-[#FF7A1A]"
                    />
                    <span>
                      I agree to the TripPilot safety guidelines, travel advisory terms, and confirm that passenger details match valid government identification.
                    </span>
                  </label>

                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full shadow-xl shadow-[#FF7A1A]/35"
                    isLoading={isProcessing}
                    disabled={!termsAccepted}
                    onClick={handleConfirm}
                    icon={<Lock className="w-4 h-4" />}
                  >
                    {isProcessing
                      ? 'Processing Payment...'
                      : currency !== 'INR'
                        ? `Confirm & Pay ₹${finalTotal.toLocaleString('en-IN')} (≈ ${convertInr(finalTotal, currency, exchangeRates).formatted})`
                        : `Confirm & Pay ₹${finalTotal.toLocaleString('en-IN')}`}
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
