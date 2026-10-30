import React, { useState } from 'react';
import {
  Search, Mic, MicOff, Sparkles, MapPin, Calendar, Users, IndianRupee,
  Plane, Train, Bus, Building, Package, ArrowRight, ExternalLink, Globe, Tag, Check, Compass, Shield
} from 'lucide-react';
import { useTripStore } from '../store/useTripStore';
import { destinations, Destination } from '../data/destinations';
import { tripModes } from '../data/tripModeRules';
import { getActiveOrUpcomingFestival } from '../data/festivals';
import {
  MOCK_FLIGHTS, MOCK_TRAINS, MOCK_BUSES, MOCK_HOTELS
} from '../services/mockData';
import { parseSearchQuery, suggestDestinations, SuggestedDestination } from '../services/gemini';
import { calculateHaversineDistance } from '../data/emergency';
import { Globe3D } from '../components/three/Globe3D';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge, DemoBadge } from '../components/ui/Badge';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

interface HomeProps {
  onStartPlanner: (prefill?: any) => void;
  onNavigateSlide: (slide: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onStartPlanner, onNavigateSlide }) => {
  const {
    language,
    selectedTripMode,
    setSelectedTripMode,
    tripDetails,
    setTripDetails,
    loadDemoTrip,
    liveLocation,
  } = useTripStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState<'flights' | 'trains' | 'buses' | 'hotels' | 'packages' | 'planner'>('planner');
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedDestination[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>(destinations.slice(0, 6));

  const festival = getActiveOrUpcomingFestival();

  // Voice Search setup
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type in the search bar.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript;
      setSearchQuery(spoken);
      setIsListening(false);
      handleExecuteSearch(spoken);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleExecuteSearch = async (queryToRun?: string) => {
    const q = (queryToRun || searchQuery).trim();
    if (!q) return;

    setIsParsing(true);
    try {
      const parsed = await parseSearchQuery(q, language);
      setTripDetails({
        destination: parsed.destination,
        from: parsed.from,
        budget: parsed.budget,
        travelers: parsed.travelers,
        interests: parsed.interests,
      });
      setSelectedTripMode(parsed.tripMode);
      onStartPlanner(parsed);
    } catch {
      onStartPlanner();
    } finally {
      setIsParsing(false);
    }
  };

  const handleAiSuggest = async () => {
    setIsLoadingAi(true);
    try {
      const res = await suggestDestinations(
        selectedTripMode,
        tripDetails.budget,
        tripDetails.travelers,
        language
      );
      setAiSuggestions(res.suggestions);
    } catch {
      // fallback
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Near Me / Geolocation calculation
  const userLat = liveLocation?.lat || 13.0827; // Chennai fallback
  const userLng = liveLocation?.lng || 80.2707;

  const nearMeDestinations = destinations
    .map((d) => ({
      ...d,
      distanceKm: calculateHaversineDistance(userLat, userLng, d.lat, d.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-24 lg:pb-16 max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-8">
      {/* 1. Hero Section: Left Smart Search & Right 3D Globe */}
      <section className="relative rounded-3xl glass-card border border-white/30 dark:border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A1A]/15 border border-[#FF7A1A]/30 text-[#FF7A1A] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'ta'
                  ? 'ஜெமினி AI இயக்கும் இந்திய பயண தளம்'
                  : 'Powered by Gemini AI Travel Engine'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-slate-900 dark:text-white leading-tight tracking-tight">
              {language === 'ta' ? (
                <>
                  உங்கள் பயணத்தை <span className="text-[#FF7A1A]">ஸ்மார்ட்டாக</span> திட்டமிடுங்கள்.
                </>
              ) : (
                <>
                  Plan Smarter. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A1A] to-amber-500">
                    Travel Safer.
                  </span>{' '}
                  Replan Instantly.
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {language === 'ta'
                ? 'சென்னை to ஊட்டி போன்ற அழகான சுற்றுலா தளங்களுக்கு துல்லியமான பயண அட்டவணை, நேரலை பாதுகாப்பு கண்காணிப்பு மற்றும் தானியங்கி மறுதிட்டமிடல் வசதி.'
                : 'Intelligent booking, real-time ghat road risk monitoring, 24/7 SOS safety shield, and automatic replanning when weather disrupts your trip.'}
            </p>

            {/* Smart Search Bar linked with Voice & Google Search / Maps */}
            <div className="relative max-w-xl">
              <div className="flex items-center rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-[#FF7A1A]/40 shadow-xl p-2 transition-all focus-within:border-[#FF7A1A] focus-within:ring-4 focus-within:ring-[#FF7A1A]/15">
                <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const q = e.target.value.toLowerCase();
                    setFilteredDestinations(
                      destinations.filter(
                        (d) =>
                          d.nameEn.toLowerCase().includes(q) ||
                          d.nameTa.includes(q) ||
                          d.stateOrCountry.toLowerCase().includes(q)
                      )
                    );
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
                  placeholder={
                    isListening
                      ? 'Listening... Speak your trip query'
                      : language === 'ta'
                      ? 'எ.கா. ₹15,000-க்குள் 3 நாள் ஊட்டி பயணம்'
                      : 'e.g. 3 day trip to Ooty under 15000'
                  }
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                />

                {/* Mic for Voice Search */}
                <button
                  onClick={handleVoiceSearch}
                  aria-label="Voice Search"
                  className={`p-2.5 rounded-xl transition-all cursor-pointer mr-1 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-slate-500 hover:text-[#FF7A1A] hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Search Button */}
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isParsing}
                  onClick={() => handleExecuteSearch()}
                  className="shrink-0"
                >
                  {language === 'ta' ? 'தேடு' : 'Search'}
                </Button>
              </div>

              {/* Sound waves when listening */}
              {isListening && (
                <div className="flex items-center gap-1 mt-2 pl-4">
                  <span className="w-1.5 h-4 bg-[#FF7A1A] rounded-full animate-bounce" />
                  <span className="w-1.5 h-6 bg-[#FF7A1A] rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-8 bg-[#FF7A1A] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-5 bg-[#FF7A1A] rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="text-xs text-[#FF7A1A] font-semibold ml-2">Listening...</span>
                </div>
              )}

              {/* Location-based & Google Search Shortcuts */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="text-slate-500 font-medium">Quick search:</span>
                {['Ooty', 'Kodaikanal', 'Valparai', 'Madurai', 'Goa'].map((place) => (
                  <button
                    key={place}
                    onClick={() => {
                      setSearchQuery(`3 day trip to ${place} under 15000`);
                      handleExecuteSearch(`3 day trip to ${place} under 15000`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 hover:bg-[#FF7A1A]/15 hover:text-[#FF7A1A] text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer border border-slate-300/40 dark:border-slate-700/40"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Hero: Low-Poly 3D Earth Globe with Flight Routes */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full flex items-center justify-center">
              <Globe3D size={340} highlightIndia />
            </div>
            <div className="text-center mt-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF7A1A] animate-ping" />
                <span>Live Route Monitor: Chennai ⇄ Ooty Sector</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Active Festival Offer Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-[#FF7A1A]/15 via-amber-500/10 to-teal-500/10 border border-[#FF7A1A]/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FF7A1A] text-white flex items-center justify-center shrink-0 shadow-md">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A1A]">
                {festival.badge}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FF7A1A] text-white">
                Code: {festival.code}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
              {language === 'ta' ? festival.nameTa : festival.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {language === 'ta' ? festival.descriptionTa : festival.description}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            loadDemoTrip();
            onNavigateSlide(1);
          }}
          className="shrink-0"
        >
          {language === 'ta' ? 'சலுகையைப் பயன்படுத்து' : 'Apply & Plan Trip'}
        </Button>
      </section>

      {/* 3. Trip Mode Selector (12 Horizontal-Scroll Pills) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white">
              {language === 'ta' ? 'உங்கள் பயண பாணியைத் தேர்வு செய்யுங்கள்' : 'Choose Your Trip Style'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalizes itinerary pace, stay recommendations, and safety defaults
            </p>
          </div>
          <Button
            size="sm"
            variant="glass"
            icon={<Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" />}
            isLoading={isLoadingAi}
            onClick={handleAiSuggest}
          >
            {language === 'ta' ? 'AI பரிந்துரை' : 'AI Suggest'}
          </Button>
        </div>

        {/* 12 Horizontal Scroll Pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {tripModes.map((mode) => {
            const isSelected = selectedTripMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedTripMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF7A1A] to-[#ff9138] text-white shadow-lg shadow-[#FF7A1A]/30 border border-[#FF7A1A] scale-[1.02]'
                    : 'glass-card border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#FF7A1A]/50'
                }`}
              >
                <span>{language === 'ta' ? mode.labelTa : mode.labelEn}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. AI Suggest Results (if requested) */}
      {aiSuggestions.length > 0 && (
        <section className="space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7A1A]" />
              <span>Gemini AI Recommended Destinations</span>
            </h3>
            <button
              onClick={() => setAiSuggestions([])}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiSuggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setTripDetails({ destination: item.name });
                  onNavigateSlide(1);
                }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center justify-between text-xs opacity-90 mb-2">
                  <span>Best Season: {item.bestTime}</span>
                  <Badge variant="orange">Est. ₹{item.estimatedCost.toLocaleString('en-IN')}</Badge>
                </div>
                <h4 className="text-xl font-bold font-heading">{item.name}</h4>
                <div className="text-xs font-tamil opacity-90 mb-2">{item.nameTa}</div>
                <p className="text-xs opacity-85 line-clamp-2">{item.whySuits}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-300">
                  <span>Plan this trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Near Me / Location-Based Suggestions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#14B8A6]" />
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              {language === 'ta' ? 'உங்களுக்கு அருகிலுள்ள சுற்றுலா தலங்கள்' : 'Near You in South India'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Calculated via live GPS distance
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearMeDestinations.map((dest) => {
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
              dest.nameEn + ' tourism guide trip'
            )}`;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${dest.lat},${dest.lng}`;

            return (
              <GlassCard
                key={dest.id}
                className="flex flex-col justify-between hover:border-[#FF7A1A]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                      {dest.distanceKm} km away
                    </span>
                    <Badge variant="orange" size="sm">
                      ★ {dest.safetyLevel}.0 Safety
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white group-hover:text-[#FF7A1A] transition-colors">
                    {dest.nameEn}
                  </h3>
                  <div className="text-xs text-slate-500 font-tamil mb-2">{dest.nameTa}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {language === 'ta' ? dest.descTa : dest.descEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Google Maps search button */}
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View location on Google Maps"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF7A1A] hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                    {/* Google Web search button */}
                    <a
                      href={googleSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Google Search travel guide"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF7A1A] hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      setTripDetails({ destination: dest.nameEn });
                      onNavigateSlide(1);
                    }}
                    className="text-xs font-bold text-[#FF7A1A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* 6. Travel Booking Services Tabs: Flights, Trains, Buses, Hotels, Packages, Planner */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {[
              { id: 'planner', label: 'AI Trip Planner', icon: Sparkles },
              { id: 'trains', label: 'Trains', icon: Train },
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'buses', label: 'Buses', icon: Bus },
              { id: 'hotels', label: 'Hotels', icon: Building },
              { id: 'packages', label: 'Tour Packages', icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#FF7A1A] text-[#FF7A1A]'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: AI Planner Shortcut */}
        {activeTab === 'planner' && (
          <GlassCard className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#0B1F3A]/80 to-[#112a4d]/90 text-white">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A1A]">
                Guided 6-Step Cockpit
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading">
                Ready to plan your 3-Day Chennai → Ooty Journey?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Experience the 6-slide guided slideshow: 1. Planner → 2. Package → 3. Verification → 4. Live Companion → 5. Replanning → 6. Dossier.
              </p>
            </div>
            <Button
              size="lg"
              variant="primary"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={() => {
                loadDemoTrip();
                onNavigateSlide(1);
              }}
              className="shrink-0 shadow-lg shadow-[#FF7A1A]/40"
            >
              Start 6-Step Journey
            </Button>
          </GlassCard>
        )}

        {/* Tab 2: Trains (with 12671 Nilgiri Express) */}
        {activeTab === 'trains' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 font-medium">
              Showing direct train options connecting Chennai & Western Ghats (Mettupalayam / Coimbatore)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_TRAINS.map((tr) => (
                <GlassCard key={tr.id} className="p-4 hover:border-[#FF7A1A]/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#FF7A1A]">{tr.id}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tr.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {tr.punctuality} On-Time
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 my-2 border-y border-slate-200/50 dark:border-slate-800">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{tr.depart}</div>
                      <div className="text-[10px] text-slate-500">{tr.from}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">{tr.duration}</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{tr.arrive}</div>
                      <div className="text-[10px] text-slate-500">{tr.to}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {tr.avail}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{tr.price}
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          loadDemoTrip();
                          onNavigateSlide(1);
                        }}
                      >
                        Book in Plan
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Flights */}
        {activeTab === 'flights' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_FLIGHTS.map((fl) => (
                <GlassCard key={fl.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{fl.airline} ({fl.id})</span>
                    <Badge variant="teal">★ {fl.rating}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs py-2 my-2 border-y border-slate-200/50 dark:border-slate-800">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{fl.depart}</div>
                      <div className="text-[10px] text-slate-500">{fl.from}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">{fl.duration} ({fl.stops})</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{fl.arrive}</div>
                      <div className="text-[10px] text-slate-500">{fl.to}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹{fl.price}</span>
                    <Button size="sm" variant="primary" onClick={() => onNavigateSlide(1)}>
                      Select Flight
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Buses */}
        {activeTab === 'buses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOCK_BUSES.map((b) => (
              <GlassCard key={b.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.operator}</h4>
                  <Badge variant="orange">★ {b.rating}</Badge>
                </div>
                <div className="text-xs text-slate-500 mb-2">{b.type}</div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="text-xs text-emerald-500 font-semibold">{b.seats} seats available</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹{b.price}</span>
                    <Button size="sm" variant="primary" onClick={() => onNavigateSlide(1)}>
                      Book
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Tab 5: Hotels */}
        {activeTab === 'hotels' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_HOTELS.map((h) => (
              <GlassCard key={h.id} className="flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{h.location}</span>
                    <Badge variant="teal">★ {h.rating}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{h.name}</h4>
                  <div className="flex flex-wrap gap-1 my-2">
                    {h.amenities.map((a, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through">₹{h.origPrice}</span>
                    <div className="text-sm font-extrabold text-[#FF7A1A]">₹{h.price}/night</div>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => onNavigateSlide(1)}>
                    Select
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Tab 6: Packages */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Backpacker Saver', price: 9800, badge: 'Budget' },
              { name: 'Standard Explorer', price: 12400, badge: 'Best Value' },
              { name: 'Family Special', price: 14600, badge: 'Family' },
              { name: 'Heritage Luxury', price: 16900, badge: 'Premium' },
            ].map((p, idx) => (
              <GlassCard key={idx} className="p-4 flex flex-col justify-between">
                <div>
                  <Badge variant="orange" size="sm">{p.badge}</Badge>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">3 Days Ooty & Coonoor with Toy Train & Stay</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#FF7A1A]">₹{p.price.toLocaleString('en-IN')}</span>
                  <Button size="sm" variant="primary" onClick={() => onNavigateSlide(2)}>
                    View Package
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
