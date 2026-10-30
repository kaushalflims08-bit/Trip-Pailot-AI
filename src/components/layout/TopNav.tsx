import React, { useState, useRef, useEffect } from 'react';
import { Plane, Compass, Sparkles, User, LogOut, CheckCircle2, Shield } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { Button } from '../ui/Button';

interface TopNavProps {
  onNavigateHome: () => void;
  onNavigateSlide: (slideNumber: number) => void;
  activeView: 'home' | 'slideshow';
}

export const TopNav: React.FC<TopNavProps> = ({
  onNavigateHome,
  onNavigateSlide,
  activeView,
}) => {
  const {
    user,
    logout,
    loadDemoTrip,
    currentStep,
    reduceAnimations,
    toggleReduceAnimations,
  } = useTripStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navLinks = [
    { id: 1, label: 'Planner' },
    { id: 2, label: 'Package' },
    { id: 3, label: 'Verification' },
    { id: 4, label: 'Live Companion' },
    { id: 5, label: 'Replanning' },
    { id: 6, label: 'Dossier' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B1F3A] to-[#FF7A1A] flex items-center justify-center text-white shadow-md shadow-[#FF7A1A]/20 group-hover:scale-105 transition-transform">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                TripPilot<span className="text-[#FF7A1A]">AI</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#FF7A1A]/15 text-[#FF7A1A] border border-[#FF7A1A]/30">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:inline">
              Plan • Travel • Replan • Safe
            </span>
          </div>
        </div>

        {/* Desktop Step Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={onNavigateHome}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
              activeView === 'home'
                ? 'text-[#FF7A1A] bg-[#FF7A1A]/10 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Explore & Home
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
          {navLinks.map((link) => {
            const isActive = activeView === 'slideshow' && currentStep === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigateSlide(link.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[38px] cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-[#FF7A1A] to-[#ff9138] shadow-sm shadow-[#FF7A1A]/30 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Start Demo Trip Button */}
          <Button
            size="sm"
            variant="primary"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => {
              loadDemoTrip();
              onNavigateSlide(1);
            }}
            className="hidden sm:inline-flex shadow-sm"
          >
            Demo Trip
          </Button>

          {/* Currency Selector */}
          <CurrencySelector compact />

          {/* Language Selector */}
          <LanguageSelector compact />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile / Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="User profile & settings"
              className="flex items-center gap-1.5 p-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors focus:outline-none min-h-[44px] cursor-pointer"
            >
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#FF7A1A]/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#0B1F3A] dark:bg-[#112a4d] border border-white/20 text-[#FF7A1A] flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
                </div>
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-card border border-white/20 dark:border-white/10 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || 'Guest Traveler'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.phone || user?.email || 'Logged in via Demo Session'}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-teal-500 font-semibold">
                    <Shield className="w-3 h-3" />
                    <span>Active Safety Shield</span>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <button
                    onClick={toggleReduceAnimations}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Reduce Animations</span>
                    <span
                      className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                        reduceAnimations ? 'bg-[#FF7A1A]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                          reduceAnimations ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      loadDemoTrip();
                      setProfileOpen(false);
                      onNavigateSlide(1);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-[#FF7A1A] font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Reset / Load Demo Trip</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
