import React, { useState, useEffect } from 'react';
import {
  Compass, MapPin, Share2, Shield, AlertTriangle, Phone, Plus,
  Sparkles, Navigation, Battery, Heart, Building, Check, Clock, Play, Pause,
  Users, DollarSign, MessageSquare, AlertCircle, ArrowRight, Volume2, Bell, Plane, CloudSun
} from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import {
  watchUserLocation, SIMULATED_OOTY_ROUTE, buildSharingLinks, LivePosition
} from '../services/location';
import {
  EMERGENCY_NUMBERS, FIRST_AID_GUIDE, MEDICAL_DISCLAIMER_EN, MEDICAL_DISCLAIMER_TA, getNearestFacilities
} from '../data/emergency';
import { DEMO_WEATHER_ADVISORY, DEMO_OOTY_ITINERARY } from '../services/mockData';
import { translatePhrase } from '../services/gemini';
import {
  alertUpcomingFlightOrTrain, alertHotelCheckin, alertLocalWeather,
  getBrowserNotificationPermission, requestBrowserNotificationPermission, NotificationPermissionState
} from '../services/browserNotifications';
import { MapView } from '../components/maps/MapView';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { SOSButton } from '../components/safety/SOSButton';
import { BudgetProgress } from '../components/ui/BudgetProgress';
import { RiskScore } from '../components/ui/RiskScore';
import { WindingRoad3D } from '../components/three/WindingRoad3D';

export const Companion: React.FC<{
  onStartTripClick: () => void;
  onFinishTripClick: () => void;
  onNavigateSlide: (slide: number) => void;
}> = ({ onStartTripClick, onFinishTripClick, onNavigateSlide }) => {
  const {
    tripDetails,
    generatedItinerary,
    expenses,
    addExpense,
    deleteExpense,
    trustedContacts,
    addTrustedContact,
    removeTrustedContact,
    liveLocation,
    setLiveLocation,
    sharingStatus,
    sharingTrackId,
    startLiveSharing,
    stopLiveSharing,
    tripStatus,
    language,
    selectedTripMode,
  } = useTripStore();

  const [simulatedIndex, setSimulatedIndex] = useState(4); // Mettupalayam foothills
  const [isSimulating, setIsSimulating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDuration, setShareDuration] = useState(60);
  const [copiedLink, setCopiedLink] = useState(false);

  // Expense Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'Stay' | 'Transport' | 'Food' | 'Activities' | 'Emergency' | 'Miscellaneous'>('Food');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('Family');

  // Translator State
  const [transInput, setTransInput] = useState('Where is the hospital?');
  const [transOutput, setTransOutput] = useState('');
  const [transLang, setTransLang] = useState('ta');
  const [isTranslating, setIsTranslating] = useState(false);

  // Health Symptom Chat State
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomAdvice, setSymptomAdvice] = useState<string | null>(null);

  // "Are you safe?" timer modal simulation
  const [showSafePrompt, setShowSafePrompt] = useState(false);
  const [safeCountdown, setSafeCountdown] = useState(60);

  // Browser Notification state
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionState>(getBrowserNotificationPermission());

  const handleEnablePushAlerts = async () => {
    const res = await requestBrowserNotificationPermission();
    setNotifPermission(res);
  };

  // Live Location Watcher
  useEffect(() => {
    const cleanup = watchUserLocation(
      (pos) => {
        setLiveLocation(pos);
        setGpsError(null);
      },
      (err, isLowAccuracy) => {
        setGpsError(err);
      }
    );
    return () => cleanup();
  }, []);

  // Simulated GPS movement loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimulatedIndex((prev) => {
        const next = (prev + 1) % SIMULATED_OOTY_ROUTE.length;
        const pt = SIMULATED_OOTY_ROUTE[next];
        setLiveLocation({
          lat: pt.lat,
          lng: pt.lng,
          accuracy: 14,
          speed: pt.speed,
          heading: 240,
          timestamp: Date.now(),
          address: pt.label,
          batteryLevel: 78,
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const currentLat = liveLocation?.lat || 11.4102;
  const currentLng = liveLocation?.lng || 76.6950;
  const { nearestHospital, nearestPolice } = getNearestFacilities(currentLat, currentLng);

  const sharingLinks = buildSharingLinks(
    liveLocation || { lat: currentLat, lng: currentLng, accuracy: 15, speed: 0, heading: 0, timestamp: Date.now() },
    sharingTrackId
  );

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleTranslate = async (textToRun?: string) => {
    const text = textToRun || transInput;
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      const res = await translatePhrase(text, 'en', transLang);
      setTransOutput(res.translation);
    } catch {
      setTransOutput('Translation unavailable offline');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) return;
    addExpense({
      title: expenseTitle.trim(),
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      date: new Date().toISOString().split('T')[0],
    });
    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    addTrustedContact({
      name: contactName.trim(),
      phone: contactPhone.trim(),
      relation: contactRelation,
    });
    setContactName('');
    setContactPhone('');
  };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Dashboard Header with Trip Control and SOS Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-white/20 dark:border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" dot>
              {tripStatus === 'active' ? 'Trip In Progress' : 'Armed & Ready'}
            </Badge>
            <span className="text-xs text-slate-400">Slide 4 of 6</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white mt-1">
            {language === 'ta' ? 'நேரலை துணை மற்றும் பாதுகாப்பு கவசம்' : 'Live Companion & Safety Shield'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active telemetry for {tripDetails.from} ⇄ {tripDetails.destination}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {tripStatus !== 'active' ? (
            <Button
              size="md"
              variant="primary"
              icon={<Play className="w-4 h-4 fill-white" />}
              onClick={onStartTripClick}
            >
              Start Trip
            </Button>
          ) : (
            <Button
              size="md"
              variant="secondary"
              icon={<Check className="w-4 h-4" />}
              onClick={onFinishTripClick}
            >
              Finish Trip
            </Button>
          )}

          {/* Emergency SOS Button with expanding ripple */}
          <SOSButton />
        </div>
      </div>

      {/* 2. Grid: Live GPS Map + Telemetry + Sharing on Left | Road Risk & Weather on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Location Tracker & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#14B8A6]" />
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                  Live Location & Satellite Telemetry
                </h3>
              </div>

              {/* Simulated Movement Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                    isSimulating
                      ? 'bg-[#14B8A6] text-white border-[#14B8A6]'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isSimulating ? 'Simulating (Hairpins)' : 'Simulate GPS'}</span>
                </button>
              </div>
            </div>

            {/* GPS Warning if any */}
            {gpsError && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Interactive Leaflet Map with CartoDB Voyager/Dark tiles */}
            <MapView
              center={[currentLat, currentLng]}
              zoom={13}
              accuracy={liveLocation?.accuracy || 15}
              showUserPulse
              height="h-72"
              markers={[
                { id: 'hosp', lat: nearestHospital.lat, lng: nearestHospital.lng, title: nearestHospital.name, type: 'hospital' },
                { id: 'pol', lat: nearestPolice.lat, lng: nearestPolice.lng, title: nearestPolice.name, type: 'police' },
              ]}
              routePolyline={SIMULATED_OOTY_ROUTE.map((pt) => [pt.lat, pt.lng])}
            />

            {/* Real-time Telemetry Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {liveLocation?.speed ?? 32} km/h
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">GPS Accuracy</div>
                <div className="text-base font-extrabold text-teal-500 mt-0.5">
                  ±{liveLocation?.accuracy || 12}m
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Battery</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{liveLocation?.batteryLevel || 84}%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Elevation</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  2,240 m
                </div>
              </div>
            </div>

            {/* Live Location Sharing Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/50 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    sharingStatus ? 'bg-teal-500 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {sharingStatus
                    ? 'Live tracking broadcast is ON'
                    : 'Location sharing is currently paused'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {sharingStatus ? (
                  <Button size="sm" variant="outline" onClick={stopLiveSharing}>
                    Stop Sharing
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Share2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      startLiveSharing(shareDuration);
                      setShowShareModal(true);
                    }}
                  >
                    Start Sharing Live Location
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => setShowShareModal(true)}
                >
                  Share Links
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Today's Itinerary Timeline */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF7A1A]" />
                <span>Today's Live Itinerary Timeline</span>
              </h3>
              <Badge variant="orange">Day 1 of 3</Badge>
            </div>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
              {DEMO_OOTY_ITINERARY[0].activities.map((act, idx) => {
                const isCurrent = idx === 2; // Check-in & lunch
                const isDone = idx < 2;

                return (
                  <div key={idx} className="relative">
                    {/* Timeline bullet dot */}
                    <div
                      className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                        isDone
                          ? 'bg-teal-500 border-teal-500'
                          : isCurrent
                          ? 'bg-[#FF7A1A] border-white shadow-[0_0_8px_#FF7A1A] animate-pulse'
                          : 'bg-slate-300 dark:bg-slate-700 border-slate-400'
                      }`}
                    />

                    <div
                      className={`p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'glass-card border-2 border-[#FF7A1A]/80 shadow-md bg-[#FF7A1A]/5'
                          : 'bg-slate-100/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {act.time}
                        </span>
                        {isDone ? (
                          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Completed
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[10px] font-bold text-[#FF7A1A] uppercase tracking-wider">
                            Current Activity
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Upcoming</span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Road Risk 3D, Weather, Budget, Healthcare (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Smart Road Risk Detection with 3D Car Simulation */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                Smart Road Risk & Ghat Analysis
              </h3>
              <Badge variant="teal">36 Hairpins</Badge>
            </div>

            <RiskScore level="low" score={18} />

            {/* 3D Winding Mountain Road Canvas */}
            <WindingRoad3D riskLevel="low" />

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>
                <strong>Route:</strong> Mettupalayam → Burliar → Coonoor (NH 181).
              </p>
              <p className="text-[11px] text-slate-500">
                Pavement is dry with moderate daylight traffic. Recommended speed on hairpin curves: 20-30 km/h.
              </p>
            </div>
          </GlassCard>

          {/* Destination Weather & Conditions */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                Destination Intelligence: Ooty
              </h3>
              <Badge variant="orange">{DEMO_WEATHER_ADVISORY.temperature}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400">Weather</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {DEMO_WEATHER_ADVISORY.weatherSummary}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400">Air Quality</span>
                <div className="font-bold text-teal-500 mt-0.5">
                  {DEMO_WEATHER_ADVISORY.airQualityIndex}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              {DEMO_WEATHER_ADVISORY.ghatCondition}
            </div>
          </GlassCard>

          {/* Budget Tracker & Category Breakdown */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                Live Budget Tracker
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                ₹{totalSpent} / ₹{tripDetails.budget}
              </span>
            </div>

            <BudgetProgress spent={totalSpent} total={tripDetails.budget} />

            {/* Quick Add Expense Form */}
            <form onSubmit={handleAddExpense} className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Expense description"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Activities</option>
                  <option>Stay</option>
                  <option>Emergency</option>
                </select>

                <Button size="sm" variant="primary" type="submit" icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Expense
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Voice & Text Translator */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#FF7A1A]" />
                <span>Instant Travel Phrase Translator</span>
              </h3>
              <select
                value={transLang}
                onChange={(e) => setTransLang(e.target.value)}
                className="text-xs bg-transparent border-0 font-bold text-[#FF7A1A] focus:outline-none cursor-pointer"
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={transInput}
                onChange={(e) => setTransInput(e.target.value)}
                placeholder="Type english phrase..."
                className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <Button size="sm" variant="primary" isLoading={isTranslating} onClick={() => handleTranslate()}>
                Translate
              </Button>
            </div>

            {/* Quick phrase chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Where is the hospital?', 'How much does this cost?', 'Please help me'].map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTransInput(phrase);
                    handleTranslate(phrase);
                  }}
                  className="px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 hover:text-[#FF7A1A] cursor-pointer"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {transOutput && (
              <div className="p-3 rounded-xl bg-[#FF7A1A]/10 border border-[#FF7A1A]/30 text-xs font-bold text-slate-900 dark:text-white font-tamil">
                {transOutput}
              </div>
            )}
          </GlassCard>

          {/* Browser Notification API: Live Travel Alerts */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF7A1A]" />
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                  Live Browser Push Notifications
                </h3>
              </div>
              {notifPermission === 'granted' ? (
                <span className="text-[10px] font-bold text-teal-500 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              ) : (
                <button
                  onClick={handleEnablePushAlerts}
                  className="text-[10px] font-bold text-white bg-[#FF7A1A] hover:bg-[#ff8f3d] px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Enable Push
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Receive native operating-system alerts on desktop and mobile even when the browser tab is minimized:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => alertUpcomingFlightOrTrain('train')}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-[#FF7A1A]/10 border border-slate-200 dark:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#FF7A1A]">
                  <Plane className="w-4 h-4 text-[#FF7A1A]" />
                  <span>Upcoming Flight/Train</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Platform 4, boarding & coach details
                </div>
              </button>

              <button
                onClick={() => alertHotelCheckin('Sterling Ooty Fern Hill')}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-teal-500/10 border border-slate-200 dark:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-500">
                  <Building className="w-4 h-4 text-teal-500" />
                  <span>Hotel Check-in</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Early room readiness & welcome pack
                </div>
              </button>

              <button
                onClick={() => alertLocalWeather('Ooty & Nilgiris')}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  <span>Local Weather Alert</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Hairpin road fog & sudden shower alert
                </div>
              </button>
            </div>
          </GlassCard>

          {/* Emergency First-Aid & Symptom Checker */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Emergency Health & First-Aid</span>
              </h3>
              <Badge variant="red">Non-diagnostic</Badge>
            </div>

            <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              {MEDICAL_DISCLAIMER_EN}
            </div>

            <div className="space-y-2">
              {FIRST_AID_GUIDE.slice(0, 2).map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white">{item.titleEn}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.stepsEn[0]}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Share Links Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Live Location Tracking Link">
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            Share this real-time link with family or friends. They can view your moving marker on a clean map without needing to log in.
          </p>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-[#FF7A1A] break-all select-all">
            {sharingLinks.trackViewerLink}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(sharingLinks.trackViewerLink);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
            >
              {copiedLink ? 'Copied Link!' : 'Copy Link'}
            </Button>

            <a href={sharingLinks.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="primary">
                WhatsApp to Family
              </Button>
            </a>

            <a href={sharingLinks.mapsLink} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="glass">
                Open in Google Maps
              </Button>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
