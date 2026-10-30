import React, { useState } from 'react';
import { Plane, CheckCircle2, Shield, Phone, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LanguageSelector } from '../components/layout/LanguageSelector';
import { triggerConfetti } from '../components/ui/Confetti';
import { PlaneFlyAcross } from '../components/ui/PlaneFlyAcross';
import { Globe3D } from '../components/three/Globe3D';

export const Login: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { setUser, language, loadDemoTrip } = useTripStore();

  const [mode, setMode] = useState<'options' | 'phone-step1' | 'phone-step2'>('options');
  const [name, setName] = useState('Karthik Subramanian');
  const [phone, setPhone] = useState('9840123456');
  const [email, setEmail] = useState('karthik.subramanian@example.com');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);
  const [showPlane, setShowPlane] = useState(false);

  // Validation
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
  const isNameValid = name.trim().length >= 2;

  const handleGoogleLogin = () => {
    setIsSuccessAnim(true);
    setShowPlane(true);
    triggerConfetti();

    setTimeout(() => {
      setUser({
        name: 'Karthik Subramanian',
        email: 'karthik.subramanian@gmail.com',
        phone: '+91 98401 23456',
        method: 'google',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        loginAt: new Date().toISOString(),
      });
      loadDemoTrip();
      onLoginSuccess();
    }, 1600);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || !isNameValid) return;
    setMode('phone-step2');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('') !== '123456') {
      alert('Invalid OTP. Please use demo OTP: 123456');
      return;
    }

    setIsSuccessAnim(true);
    setShowPlane(true);
    triggerConfetti();

    setTimeout(() => {
      setUser({
        name: name.trim(),
        phone: `+91 ${phone}`,
        email: email.trim() || undefined,
        method: 'phone',
        loginAt: new Date().toISOString(),
      });
      loadDemoTrip();
      onLoginSuccess();
    }, 1600);
  };

  const handleOtpChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto focus next
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#071427] text-slate-100 overflow-hidden">
      {showPlane && <PlaneFlyAcross />}

      {/* 3D Earth Decorative Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <Globe3D size={560} highlightIndia />
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-[420px] rounded-3xl glass-card border border-white/20 dark:border-white/10 p-6 sm:p-8 shadow-2xl z-10 backdrop-blur-2xl">
        {/* Top Header with Language Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B1F3A] to-[#FF7A1A] flex items-center justify-center text-white shadow-md">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <span className="font-extrabold text-base tracking-tight font-heading">
              TripPilot<span className="text-[#FF7A1A]">AI</span>
            </span>
          </div>
          <LanguageSelector compact />
        </div>

        {isSuccessAnim ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 ring-8 ring-teal-500/10">
              <CheckCircle2 className="w-10 h-10 animate-in zoom-in-75 duration-300" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white">
              {language === 'ta' ? 'உள்நுழைவு வெற்றிகரமாக முடிந்தது!' : 'Welcome Aboard!'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ta' ? 'உங்கள் பயணம் தயாராகிறது...' : 'Loading your safe travel cockpit...'}
            </p>
          </div>
        ) : mode === 'options' ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                {language === 'ta' ? 'TripPilot AI-க்கு வரவேற்கிறோம்' : 'Welcome to TripPilot AI'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'ta'
                  ? 'ஸ்மார்ட்டாகத் திட்டமிடுங்கள். பாதுகாப்பாகப் பயணியுங்கள்.'
                  : 'Plan smarter. Travel safer.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-800 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md active:scale-[0.98] cursor-pointer min-h-[46px]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{language === 'ta' ? 'Google மூலம் தொடரவும்' : 'Continue with Google'}</span>
              </button>

              <div className="text-[10px] text-center text-slate-400">
                Demo Google sign-in — 1-click instant session
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-700 w-full" />
                <span className="bg-[#071427] px-3 text-[11px] text-slate-400 uppercase tracking-widest absolute">
                  or
                </span>
              </div>

              {/* Phone Login Option */}
              <button
                onClick={() => setMode('phone-step1')}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer min-h-[46px]"
              >
                <Phone className="w-4 h-4 text-[#FF7A1A]" />
                <span>{language === 'ta' ? 'தொலைபேசி எண் மூலம் தொடரவும்' : 'Continue with Phone'}</span>
              </button>
            </div>
          </>
        ) : mode === 'phone-step1' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => setMode('options')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div>
              <h3 className="text-base font-bold text-white font-heading">
                {language === 'ta' ? 'தொலைபேசி எண் சரிபார்ப்பு' : 'Mobile Verification'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your details to receive an instant verification OTP.
              </p>
            </div>

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karthik Subramanian"
              isValid={isNameValid}
              required
            />

            <Input
              label="Indian Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile (e.g. 9840123456)"
              leftIcon={<span className="text-xs font-bold text-slate-400">+91</span>}
              isValid={isPhoneValid}
              error={phone && !isPhoneValid ? 'Enter a valid 10-digit Indian phone starting with 6-9' : undefined}
              required
            />

            <Input
              label="Email (Optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="karthik@example.com"
              type="email"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!isPhoneValid || !isNameValid}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {language === 'ta' ? 'OTP அனுப்பு' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => setMode('phone-step1')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div>
              <h3 className="text-base font-bold text-white font-heading">Enter 6-Digit OTP</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sent to <strong className="text-white">+91 {phone}</strong>
              </p>
            </div>

            <div className="flex justify-between gap-1.5 my-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-slate-900 border border-slate-700 focus:border-[#FF7A1A] focus:ring-2 focus:ring-[#FF7A1A]/40 focus:outline-none text-white"
                />
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[11px] text-teal-400 text-center font-medium">
              Demo OTP pre-filled: <strong>123456</strong>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              {language === 'ta' ? 'சரிபார்த்து தொடரவும்' : 'Verify & Continue'}
            </Button>
          </form>
        )}

        {/* Safety Note */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-teal-500" />
          <span>256-Bit Encrypted Indian Travel Shield</span>
        </div>
      </div>
    </div>
  );
};
