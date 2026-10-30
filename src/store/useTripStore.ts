import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LanguageCode } from '../i18n';
import { DayItinerary, PackageOption, ExpenseItem, TrustedContact, DEMO_OOTY_ITINERARY, DEMO_EXPENSES, generatePackagesForBudget } from '../services/mockData';
import { LivePosition } from '../services/location';
import { FALLBACK_INR_RATES, fetchLiveExchangeRates } from '../services/currency';

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  method: 'google' | 'phone';
  photo?: string;
  loginAt: string;
}

export interface TravelerInfo {
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  idType: 'Aadhaar' | 'Passport' | 'Driving Licence';
  idNumber: string;
  emergencyContact?: string;
  healthNotes?: string;
}

export interface BookingInfo {
  bookingId: string;
  destination: string;
  from: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  package: PackageOption;
  totalAmount: number;
  baseAmount: number;
  gstAmount: number;
  discountAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  bookedAt: string;
}

export interface TripNotification {
  id: string;
  type: 'booking' | 'budget' | 'traffic' | 'trip-started' | 'trip-completed' | 'sharing' | 'gps' | 'disruption';
  title: string;
  titleTa?: string;
  message: string;
  messageTa?: string;
  timestamp: number;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  quickReplies?: string[];
  isDemoFallback?: boolean;
}

export interface TripDetails {
  from: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  travelStyle: string;
  interests: string[];
  transport: string;
  stayPreference: string;
  pace: 'relaxed' | 'balanced' | 'packed';
}

interface TripStoreState {
  // Persisted
  user: UserProfile | null;
  language: LanguageCode;
  currency: string; // e.g. 'INR', 'USD', 'EUR', 'GBP', etc.
  exchangeRates: Record<string, number>;
  darkMode: boolean;
  reduceAnimations: boolean;
  tripDetails: TripDetails;
  selectedTripMode: string;
  selectedDestination: string;
  tripDuration: number;
  travelerCount: number;
  generatedItinerary: DayItinerary[];
  selectedPackage: PackageOption | null;
  packageOptions: PackageOption[];
  travelers: TravelerInfo[];
  booking: BookingInfo | null;
  replanningHistory: any[];
  expenses: ExpenseItem[];
  notifications: TripNotification[];
  trustedContacts: TrustedContact[];
  completedSteps: number[]; // 1 to 6
  currentStep: number;     // 1 to 6
  tripStatus: 'not-started' | 'active' | 'finished';
  liveLocation: LivePosition | null;
  sharingStatus: boolean;
  sharingTrackId: string;
  sharingExpiresAt: number | null;
  activeDisruption: string | null;

  // Session-only (non-persisted)
  assistant: {
    isOpen: boolean;
    messages: ChatMessage[];
    isLoading: boolean;
    voiceOutputEnabled: boolean;
    unreadAlert: boolean;
  };
  hasSeenSplashThisSession: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  setLanguage: (lang: LanguageCode) => void;
  setCurrency: (currency: string) => void;
  fetchRates: () => Promise<void>;
  toggleDarkMode: () => void;
  toggleReduceAnimations: () => void;
  setTripDetails: (details: Partial<TripDetails>) => void;
  setSelectedTripMode: (mode: string) => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  setGeneratedItinerary: (itinerary: DayItinerary[]) => void;
  setSelectedPackage: (pkg: PackageOption) => void;
  setTravelers: (travelers: TravelerInfo[]) => void;
  confirmBooking: (booking: BookingInfo) => void;
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addNotification: (notif: Omit<TripNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  addTrustedContact: (contact: Omit<TrustedContact, 'id'>) => void;
  removeTrustedContact: (id: string) => void;
  setLiveLocation: (pos: LivePosition | null) => void;
  startLiveSharing: (durationMinutes: number) => string;
  stopLiveSharing: () => void;
  startTrip: () => void;
  finishTrip: () => void;
  setSplashSeen: (seen: boolean) => void;
  setActiveDisruption: (disruption: string | null) => void;
  addReplanningRecord: (record: any) => void;

  // Assistant actions
  setAssistantOpen: (open: boolean) => void;
  addAssistantMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setAssistantLoading: (loading: boolean) => void;
  toggleVoiceOutput: () => void;
  clearAssistantChat: () => void;

  // Master Demo Loader
  loadDemoTrip: () => void;
}

export const useTripStore = create<TripStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      language: 'en',
      currency: 'INR',
      exchangeRates: FALLBACK_INR_RATES,
      darkMode: true,
      reduceAnimations: false,
      tripDetails: {
        from: 'Chennai',
        destination: 'Ooty',
        startDate: '2026-11-06',
        endDate: '2026-11-08',
        travelers: 2,
        budget: 15000,
        travelStyle: 'Nature & Relaxed',
        interests: ['Tea Estates', 'Toy Train', 'Local Food', 'Viewpoints'],
        transport: 'Train + Road',
        stayPreference: 'Budget hotel/homestay',
        pace: 'balanced',
      },
      selectedTripMode: 'family',
      selectedDestination: 'Ooty',
      tripDuration: 3,
      travelerCount: 2,
      generatedItinerary: DEMO_OOTY_ITINERARY,
      packageOptions: generatePackagesForBudget(15000),
      selectedPackage: generatePackagesForBudget(15000)[1], // Standard
      travelers: [
        {
          fullName: 'Karthik Subramanian',
          age: 29,
          gender: 'Male',
          phone: '+91 98401 23456',
          email: 'karthik.subramanian@example.com',
          idType: 'Aadhaar',
          idNumber: 'XXXX XXXX 4821',
          emergencyContact: '+91 94440 98765',
        },
        {
          fullName: 'Priya Karthik',
          age: 27,
          gender: 'Female',
          phone: '+91 98401 65432',
          email: 'priya.karthik@example.com',
          idType: 'Aadhaar',
          idNumber: 'XXXX XXXX 9104',
          emergencyContact: '+91 94440 98765',
        },
      ],
      booking: null,
      replanningHistory: [],
      expenses: DEMO_EXPENSES,
      notifications: [
        {
          id: 'notif-welcome',
          type: 'booking',
          title: 'Welcome to TripPilot AI',
          titleTa: 'TripPilot AI-க்கு வரவேற்கிறோம்',
          message: 'Smart travel safety shield is armed. Ready to explore Nilgiris safely.',
          messageTa: 'ஸ்மார்ட் பயண பாதுகாப்பு கவசம் தயாராக உள்ளது.',
          timestamp: Date.now() - 3600000,
          read: false,
        },
      ],
      trustedContacts: [
        { id: 'tc-1', name: 'Ravi Subramanian (Dad)', phone: '+91 94440 98765', relation: 'Father' },
        { id: 'tc-2', name: 'Anitha Ramesh (Sister)', phone: '+91 98410 55443', relation: 'Sister' },
      ],
      completedSteps: [],
      currentStep: 1,
      tripStatus: 'not-started',
      liveLocation: {
        lat: 11.4102,
        lng: 76.6950,
        accuracy: 12,
        speed: 34,
        heading: 210,
        timestamp: Date.now(),
        address: 'Commercial Road, Ooty, Nilgiris',
        batteryLevel: 82,
      },
      sharingStatus: false,
      sharingTrackId: 'tp-live-7842',
      sharingExpiresAt: null,
      activeDisruption: null,

      // Session non-persisted initial state
      assistant: {
        isOpen: false,
        messages: [
          {
            id: 'init-msg',
            sender: 'assistant',
            text: `👋 **Vanakkam! Welcome to TripPilot AI.**
I'm your Gemini-powered co-pilot for your journey from **Chennai to Ooty**. 
Ask me about road conditions, hairpin bends, emergency contacts, budget updates, or tap any quick action below!`,
            timestamp: Date.now(),
            quickReplies: ['Check route safety', 'My budget', 'Nearest hospital'],
          },
        ],
        isLoading: false,
        voiceOutputEnabled: false,
        unreadAlert: false,
      },
      hasSeenSplashThisSession: false,

      // Setters
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      fetchRates: async () => {
        const rates = await fetchLiveExchangeRates();
        set({ exchangeRates: rates });
      },
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleReduceAnimations: () => set((s) => ({ reduceAnimations: !s.reduceAnimations })),
      setTripDetails: (details) => set((s) => ({ tripDetails: { ...s.tripDetails, ...details } })),
      setSelectedTripMode: (selectedTripMode) => set({ selectedTripMode }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      markStepCompleted: (step) =>
        set((s) => ({
          completedSteps: s.completedSteps.includes(step) ? s.completedSteps : [...s.completedSteps, step],
        })),
      setGeneratedItinerary: (generatedItinerary) => set({ generatedItinerary }),
      setSelectedPackage: (selectedPackage) => set({ selectedPackage }),
      setTravelers: (travelers) => set({ travelers }),
      confirmBooking: (booking) => {
        set((s) => ({
          booking,
          completedSteps: s.completedSteps.includes(3) ? s.completedSteps : [...s.completedSteps, 1, 2, 3],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              type: 'booking',
              title: `Booking Confirmed: ${booking.bookingId}`,
              titleTa: `முன்பதிவு உறுதி செய்யப்பட்டது: ${booking.bookingId}`,
              message: `${booking.destination} trip confirmed for ${booking.travelerCount} travelers. Total paid: ₹${booking.totalAmount.toLocaleString('en-IN')}`,
              messageTa: `${booking.destination} பயணம் ${booking.travelerCount} பயணிகளுக்கு உறுதி செய்யப்பட்டது. தொகை: ₹${booking.totalAmount.toLocaleString('en-IN')}`,
              timestamp: Date.now(),
              read: false,
            },
            ...s.notifications,
          ],
        }));
      },
      addExpense: (expense) => {
        const item: ExpenseItem = { ...expense, id: `exp-${Date.now()}` };
        set((s) => {
          const newExpenses = [item, ...s.expenses];
          const totalSpent = newExpenses.reduce((sum, e) => sum + e.amount, 0);
          const budget = s.tripDetails.budget;
          let newNotif = s.notifications;
          if (totalSpent > budget) {
            newNotif = [
              {
                id: `notif-budget-${Date.now()}`,
                type: 'budget',
                title: 'Budget Alert Exceeded',
                titleTa: 'பட்ஜெட் எச்சரிக்கை',
                message: `You have exceeded your trip budget by ₹${(totalSpent - budget).toLocaleString('en-IN')}.`,
                messageTa: `உங்கள் பயண பட்ஜெட்டை விட ₹${(totalSpent - budget).toLocaleString('en-IN')} அதிகமாக செலவாகியுள்ளது.`,
                timestamp: Date.now(),
                read: false,
              },
              ...s.notifications,
            ];
          }
          return { expenses: newExpenses, notifications: newNotif };
        });
      },
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
      addNotification: (notif) =>
        set((s) => ({
          notifications: [
            { ...notif, id: `notif-${Date.now()}`, timestamp: Date.now(), read: false },
            ...s.notifications,
          ],
        })),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      addTrustedContact: (contact) =>
        set((s) => ({
          trustedContacts: s.trustedContacts.length < 5
            ? [...s.trustedContacts, { ...contact, id: `tc-${Date.now()}` }]
            : s.trustedContacts,
        })),
      removeTrustedContact: (id) =>
        set((s) => ({ trustedContacts: s.trustedContacts.filter((c) => c.id !== id) })),
      setLiveLocation: (liveLocation) => set({ liveLocation }),
      startLiveSharing: (durationMinutes) => {
        const trackId = `track-${Math.random().toString(36).substring(2, 9)}`;
        const expiresAt = durationMinutes > 0 ? Date.now() + durationMinutes * 60000 : null;
        set((s) => ({
          sharingStatus: true,
          sharingTrackId: trackId,
          sharingExpiresAt: expiresAt,
          notifications: [
            {
              id: `notif-share-${Date.now()}`,
              type: 'sharing',
              title: 'Live Location Sharing Started',
              titleTa: 'நேரலை இருப்பிடப் பகிர்வு தொடங்கியது',
              message: `Live tracking link active for ${durationMinutes > 0 ? `${durationMinutes} mins` : 'trip duration'}.`,
              messageTa: `நேரலை கண்காணிப்பு இணைப்பு இயக்கப்பட்டது.`,
              timestamp: Date.now(),
              read: false,
            },
            ...s.notifications,
          ],
        }));
        return trackId;
      },
      stopLiveSharing: () =>
        set((s) => ({
          sharingStatus: false,
          sharingExpiresAt: null,
          notifications: [
            {
              id: `notif-share-stop-${Date.now()}`,
              type: 'sharing',
              title: 'Live Location Sharing Stopped',
              titleTa: 'நேரலை இருப்பிடப் பகிர்வு நிறுத்தப்பட்டது',
              message: 'Tracking link has been deactivated.',
              messageTa: 'கண்காணிப்பு இணைப்பு முடக்கப்பட்டது.',
              timestamp: Date.now(),
              read: false,
            },
            ...s.notifications,
          ],
        })),
      startTrip: () =>
        set((s) => ({
          tripStatus: 'active',
          notifications: [
            {
              id: `notif-start-${Date.now()}`,
              type: 'trip-started',
              title: 'Journey Started!',
              titleTa: 'உங்கள் பயணம் தொடங்கியது!',
              message: `${s.tripDetails.destination} adventure is now live. Safe travels!`,
              messageTa: `${s.tripDetails.destination} பயணம் தொடங்கியது. பாதுகாப்பான பயணம் அமையட்டும்!`,
              timestamp: Date.now(),
              read: false,
            },
            ...s.notifications,
          ],
        })),
      finishTrip: () =>
        set((s) => ({
          tripStatus: 'finished',
          notifications: [
            {
              id: `notif-finish-${Date.now()}`,
              type: 'trip-completed',
              title: 'Trip Completed Successfully!',
              titleTa: 'பயணம் வெற்றிகரமாக முடிந்தது!',
              message: `Hope you had a safe and memorable journey to ${s.tripDetails.destination}!`,
              messageTa: `உங்கள் ${s.tripDetails.destination} பயணம் இனிமையாகவும் பாதுகாப்பாகவும் அமைந்திருக்கும் என நம்புகிறோம்!`,
              timestamp: Date.now(),
              read: false,
            },
            ...s.notifications,
          ],
        })),
      setSplashSeen: (hasSeenSplashThisSession) => set({ hasSeenSplashThisSession }),
      setActiveDisruption: (activeDisruption) => set({ activeDisruption }),
      addReplanningRecord: (record) => set((s) => ({ replanningHistory: [record, ...s.replanningHistory] })),

      // Assistant
      setAssistantOpen: (isOpen) =>
        set((s) => ({ assistant: { ...s.assistant, isOpen, unreadAlert: false } })),
      addAssistantMessage: (msg) =>
        set((s) => ({
          assistant: {
            ...s.assistant,
            messages: [
              ...s.assistant.messages,
              { ...msg, id: `msg-${Date.now()}-${Math.random()}`, timestamp: Date.now() },
            ],
          },
        })),
      setAssistantLoading: (isLoading) =>
        set((s) => ({ assistant: { ...s.assistant, isLoading } })),
      toggleVoiceOutput: () =>
        set((s) => ({ assistant: { ...s.assistant, voiceOutputEnabled: !s.assistant.voiceOutputEnabled } })),
      clearAssistantChat: () =>
        set((s) => ({
          assistant: {
            ...s.assistant,
            messages: [
              {
                id: 'init-msg',
                sender: 'assistant',
                text: 'Chat history cleared. How can I assist you with your travels?',
                timestamp: Date.now(),
                quickReplies: ['Check route safety', 'My budget', 'Nearest hospital'],
              },
            ],
          },
        })),

      // Load Master Demo
      loadDemoTrip: () => {
        const pkgs = generatePackagesForBudget(15000);
        set({
          user: {
            name: 'Karthik Subramanian',
            phone: '+91 98401 23456',
            email: 'karthik.subramanian@example.com',
            method: 'google',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            loginAt: new Date().toISOString(),
          },
          tripDetails: {
            from: 'Chennai',
            destination: 'Ooty',
            startDate: '2026-11-06',
            endDate: '2026-11-08',
            travelers: 2,
            budget: 15000,
            travelStyle: 'Nature & Relaxed',
            interests: ['Tea Estates', 'Toy Train', 'Local Food', 'Viewpoints'],
            transport: 'Train + Road',
            stayPreference: 'Budget hotel/homestay',
            pace: 'balanced',
          },
          selectedTripMode: 'family',
          selectedDestination: 'Ooty',
          tripDuration: 3,
          travelerCount: 2,
          generatedItinerary: DEMO_OOTY_ITINERARY,
          packageOptions: pkgs,
          selectedPackage: pkgs[1], // Standard package
          expenses: DEMO_EXPENSES,
          currentStep: 1, // Ready on Slide 1 for interactive demonstration
          completedSteps: [],
        });
      },
    }),
    {
      name: 'trippilot-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        language: state.language,
        currency: state.currency,
        darkMode: state.darkMode,
        reduceAnimations: state.reduceAnimations,
        tripDetails: state.tripDetails,
        selectedTripMode: state.selectedTripMode,
        selectedDestination: state.selectedDestination,
        tripDuration: state.tripDuration,
        travelerCount: state.travelerCount,
        generatedItinerary: state.generatedItinerary,
        selectedPackage: state.selectedPackage,
        packageOptions: state.packageOptions,
        travelers: state.travelers,
        booking: state.booking,
        replanningHistory: state.replanningHistory,
        expenses: state.expenses,
        notifications: state.notifications,
        trustedContacts: state.trustedContacts,
        completedSteps: state.completedSteps,
        currentStep: state.currentStep,
        tripStatus: state.tripStatus,
        sharingStatus: state.sharingStatus,
        sharingTrackId: state.sharingTrackId,
        sharingExpiresAt: state.sharingExpiresAt,
      }),
    }
  )
);
