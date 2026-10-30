import { DEMO_OOTY_ITINERARY, DayItinerary, PackageOption } from './mockData';

/**
 * Helper to call server-side Gemini proxy endpoints with 8s timeout
 */
async function callServerApi(endpoint: string, body: any): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8500);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ----------------------------------------------------------------------
// 1. Generate Trip Plan
// ----------------------------------------------------------------------
export interface GeneratePlanParams {
  from: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  travelStyle: string;
  interests: string[];
  transport: string;
  stay: string;
  pace: string;
  tripMode: string;
  language: string;
}

export interface PlanResult {
  days: DayItinerary[];
  estimatedTotal: number;
  safetyTips: string[];
  weatherNotes: string[];
  isDemoFallback: boolean;
}

export async function generateTripPlan(params: GeneratePlanParams): Promise<PlanResult> {
  try {
    const data = await callServerApi('/api/gemini/plan', params);
    if (data.days && Array.isArray(data.days) && data.days.length > 0) {
      return {
        days: data.days,
        estimatedTotal: data.estimatedTotal || params.budget,
        safetyTips: data.safetyTips || ['Keep emergency contacts handy', 'Stay on marked trails'],
        weatherNotes: data.weatherNotes || ['Pack warm clothing for evening breeze'],
        isDemoFallback: false,
      };
    }
  } catch {
    // Graceful fallback to rich preloaded Ooty plan
  }

  return {
    days: DEMO_OOTY_ITINERARY,
    estimatedTotal: 12400,
    safetyTips: [
      'Ghat road has 36 hairpin bends between Kallar and Coonoor; drive carefully or take the toy train.',
      'Carry light woolens; night temperature in Ooty drops to 12°C.',
      'Emergency SOS is active in the Companion tab with one-tap 108/112 dialling.'
    ],
    weatherNotes: [
      'Morning mist expected; daytime temperatures comfortable around 20°C with clear viewpoints.'
    ],
    isDemoFallback: true,
  };
}

// ----------------------------------------------------------------------
// 2. Parse Search Query
// ----------------------------------------------------------------------
export interface ParsedSearch {
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  tripMode: string;
  interests: string[];
  from: string;
  isDemoFallback: boolean;
}

export async function parseSearchQuery(query: string, language: string): Promise<ParsedSearch> {
  try {
    const data = await callServerApi('/api/gemini/parse-search', { query, language });
    if (data.destination) {
      return {
        destination: data.destination || 'Ooty',
        days: Number(data.days) || 3,
        budget: Number(data.budget) || 15000,
        travelers: Number(data.travelers) || 2,
        tripMode: data.tripMode || 'family',
        interests: Array.isArray(data.interests) ? data.interests : ['Sightseeing', 'Nature'],
        from: data.from || 'Chennai',
        isDemoFallback: false,
      };
    }
  } catch {
    // fallback
  }

  // Regex fallback
  const budgetMatch = query.match(/(?:under|below|budget|ரூ|₹)\s*(\d+k|\d+000|\d+)/i);
  let parsedBudget = 15000;
  if (budgetMatch) {
    const val = budgetMatch[1].toLowerCase();
    parsedBudget = val.endsWith('k') ? parseInt(val) * 1000 : parseInt(val);
  }

  const daysMatch = query.match(/(\d+)\s*(?:day|நாட்கள்|दिन)/i);
  const parsedDays = daysMatch ? parseInt(daysMatch[1]) : 3;

  return {
    destination: query.toLowerCase().includes('kodai') ? 'Kodaikanal' : 'Ooty',
    days: parsedDays,
    budget: parsedBudget || 15000,
    travelers: 2,
    tripMode: query.toLowerCase().includes('adventure') ? 'adventure' : 'family',
    interests: ['Nature', 'Viewpoints', 'Tea Estates', 'Local Food'],
    from: 'Chennai',
    isDemoFallback: true,
  };
}

// ----------------------------------------------------------------------
// 3. AI Suggest Destinations
// ----------------------------------------------------------------------
export interface SuggestedDestination {
  name: string;
  nameTa: string;
  whySuits: string;
  whySuitsTa: string;
  estimatedCost: number;
  bestTime: string;
  gradient: string;
}

export async function suggestDestinations(
  tripMode: string,
  budget: number,
  duration: number,
  language: string
): Promise<{ suggestions: SuggestedDestination[]; isDemoFallback: boolean }> {
  try {
    const data = await callServerApi('/api/gemini/suggest-destinations', { tripMode, budget, duration, language });
    if (data.suggestions && data.suggestions.length > 0) {
      const gradients = [
        'from-emerald-700 via-teal-800 to-slate-900',
        'from-blue-700 via-indigo-900 to-slate-900',
        'from-amber-600 via-orange-800 to-slate-900',
      ];
      return {
        suggestions: data.suggestions.map((s: any, idx: number) => ({
          name: s.name,
          nameTa: s.nameTa || s.name,
          whySuits: s.whySuits,
          whySuitsTa: s.whySuitsTa || s.whySuits,
          estimatedCost: s.estimatedCost || budget,
          bestTime: s.bestTime || 'All Year',
          gradient: gradients[idx % gradients.length],
        })),
        isDemoFallback: false,
      };
    }
  } catch {
    // fallback
  }

  return {
    suggestions: [
      {
        name: 'Ooty & Coonoor',
        nameTa: 'ஊட்டி & குன்னூர்',
        whySuits: 'World-famous tea gardens, Nilgiri mountain heritage railway, and pleasant climate within your budget.',
        whySuitsTa: 'தேயிலைத் தோட்டங்கள், மலை ரயில் மற்றும் இதமான குளிர்ந்த வானிலை உங்கள் பட்ஜெட்டுக்கு ஏற்றது.',
        estimatedCost: 12400,
        bestTime: 'Oct - May',
        gradient: 'from-emerald-700 via-teal-800 to-slate-900',
      },
      {
        name: 'Kodaikanal',
        nameTa: 'கொடைக்கானல்',
        whySuits: 'Pine forests, peaceful boating on star lake, and budget homestays overlooking Pillar Rocks.',
        whySuitsTa: 'பைன் காடுகள், நட்சத்திர ஏரி படகு சவாரி மற்றும் அமைதியான மலைவாசம்.',
        estimatedCost: 11800,
        bestTime: 'Sep - May',
        gradient: 'from-blue-700 via-indigo-900 to-slate-900',
      },
      {
        name: 'Yercaud Hills',
        nameTa: 'ஏற்காடு',
        whySuits: 'Relaxed coffee estates, scenic lady seat viewpoint, and zero crowd congestion.',
        whySuitsTa: 'அமைதியான காபி தோட்டங்கள், லேடி சீட் பார்வை மற்றும் நெரிசல் இல்லாத சூழல்.',
        estimatedCost: 9500,
        bestTime: 'All Year',
        gradient: 'from-teal-700 via-emerald-900 to-slate-900',
      },
    ],
    isDemoFallback: true,
  };
}

// ----------------------------------------------------------------------
// 4. Recommend Package
// ----------------------------------------------------------------------
export async function recommendPackage(
  packages: PackageOption[],
  budget: number,
  tripMode: string,
  language: string
): Promise<{ recommendedId: string; reason: string; reasonTa: string; isDemoFallback: boolean }> {
  try {
    const data = await callServerApi('/api/gemini/recommend-package', {
      packages: packages.map(p => ({ id: p.id, name: p.name, price: p.price, features: p.features })),
      budget,
      tripMode,
      language
    });
    if (data.recommendedId) {
      return {
        recommendedId: data.recommendedId,
        reason: data.reason,
        reasonTa: data.reasonTa || data.reason,
        isDemoFallback: false,
      };
    }
  } catch {
    // fallback
  }

  return {
    recommendedId: 'standard',
    reason: 'Standard Explorer gives you confirmed 3rd AC Nilgiri express train and private sedan cab for ₹12,400.',
    reasonTa: 'ஸ்டாண்டர்ட் எக்ஸ்ப்ளோரர் ₹12,400 விலையில் 3-ஆம் வகுப்பு ஏசி ரயில் மற்றும் பிரத்யேக கார் வழங்குகிறது.',
    isDemoFallback: true,
  };
}

// ----------------------------------------------------------------------
// 5. Replanning Engine
// ----------------------------------------------------------------------
export interface ReplanResult {
  revisedDays: DayItinerary[];
  reason: string;
  reasonTa: string;
  costImpact: number;
  safetyImpact: string;
  safetyImpactTa: string;
  isDemoFallback: boolean;
}

export async function replanItinerary(
  currentDays: DayItinerary[],
  disruptionType: string,
  balance: number,
  language: string
): Promise<ReplanResult> {
  try {
    const data = await callServerApi('/api/gemini/replan', {
      currentDays: currentDays.map(d => ({ day: d.day, title: d.title, activities: d.activities.map(a => a.title) })),
      disruptionType,
      balance,
      language,
    });
    if (data.revisedDays && Array.isArray(data.revisedDays) && data.revisedDays.length > 0) {
      return {
        revisedDays: data.revisedDays,
        reason: data.reason,
        reasonTa: data.reasonTa || data.reason,
        costImpact: data.costImpact || 0,
        safetyImpact: data.safetyImpact || 'Route secured',
        safetyImpactTa: data.safetyImpactTa || 'பாதுகாப்பான மாற்று ஏற்பாடு செய்யப்பட்டது',
        isDemoFallback: false,
      };
    }
  } catch {
    // fallback
  }

  // Realistic fallback for heavy rain / road block
  const revised = JSON.parse(JSON.stringify(DEMO_OOTY_ITINERARY));
  if (revised[0]?.activities[4]) {
    revised[0].activities[4] = {
      time: '05:30 PM',
      title: 'Indoor Nilgiri Honey & Bee Museum + Artisanal Tasting',
      titleTa: 'தேன் அருங்காட்சியகம் மற்றும் பாரம்பரிய சாக்லேட் உலா',
      location: 'Club Road, Ooty',
      lat: 11.4050,
      lng: 76.6990,
      type: 'food',
      estCost: 400,
      notes: 'Safe indoor cultural experience discovering indigenous Toda tribal honey collection with fresh tea.',
      notesTa: 'மழைக்கு இதமான உள்அரங்கு பழங்குடியினர் தேன் தயாரிப்பு பார்வை.',
      isCompleted: false,
    };
  }

  return {
    revisedDays: revised,
    reason: 'Heavy rain alert: Open-air lake boating and slippery Doddabetta steps replaced with warm indoor Honey Museum, Tea Tasting masterclass, and covered local craft bazaars.',
    reasonTa: 'கனமழை எச்சரிக்கை: திறந்தவெளி ஏரி படகு சவாரிக்கு பதிலாக கதகதப்பான தேன் அருங்காட்சியகம் மற்றும் உள்அரங்கு தேயிலை தயாரிப்பு பயிற்சிக்கு மாற்றப்பட்டுள்ளது.',
    costImpact: -450,
    safetyImpact: 'Avoided lightning exposure, zero waterlogging risk, and 100% dry transit.',
    safetyImpactTa: 'இடி மின்னல் மற்றும் நீர் தேங்கும் ஆபத்துக்கள் முற்றிலும் தவிர்க்கப்பட்டு பாதுகாப்பான பயணம் உறுதி செய்யப்பட்டது.',
    isDemoFallback: true,
  };
}

// ----------------------------------------------------------------------
// 6. Assistant Message
// ----------------------------------------------------------------------
export interface AssistantAction {
  type: 'navigate' | 'applyReplan' | 'startSharing' | 'startSOS' | 'openPage';
  payload?: any;
}

export interface AssistantResponse {
  reply: string;
  actions: AssistantAction[];
  quickReplies: string[];
  isDemoFallback: boolean;
}

export async function sendAssistantMessage(
  userMessage: string,
  tripContext: any,
  language: string
): Promise<AssistantResponse> {
  try {
    const data = await callServerApi('/api/gemini/assistant', { userMessage, tripContext, language });
    if (data.reply) {
      return {
        reply: data.reply,
        actions: data.actions || [],
        quickReplies: data.quickReplies || ['What is the weather?', 'Nearby hospital', 'Replan my trip'],
        isDemoFallback: false,
      };
    }
  } catch {
    // fallback
  }

  const lower = userMessage.toLowerCase();
  let reply = '';
  let quickReplies = ['Check route safety', 'My budget', 'Nearby hospital'];

  if (lower.includes('hospital') || lower.includes('மருத்துவமனை') || lower.includes('doctor')) {
    reply = `### 🏥 Nearest Hospital Information
- **Government District Headquarters Hospital, Ooty**: Hospital Road (0423-2442212) — 24/7 Trauma Care.
- **Ambulance Dispatch**: Dial **108** (Toll-Free).

> **Disclaimer:** *TripPilot AI does not provide medical diagnoses or prescriptions. In emergencies, immediately call 108 or 112.*`;
  } else if (lower.includes('budget') || lower.includes('பட்ஜெட்') || lower.includes('expense')) {
    reply = `### 💰 Live Budget Status
- **Allocated Budget:** ₹${tripContext.budget || 15000}
- **Current Spent:** ₹${tripContext.spent || 6800}
- **Remaining Balance:** ₹${(tripContext.budget || 15000) - (tripContext.spent || 6800)}
You are currently **on track** with 54% budget remaining for shopping and food!`;
  } else if (lower.includes('weather') || lower.includes('வானிலை') || lower.includes('rain')) {
    reply = `### ⛅ Ooty Weather Update
- **Temperature:** 14°C - 21°C
- **Conditions:** Pleasant breeze with gentle evening mist.
- **Advisory:** Light showers possible around 5 PM near Doddabetta; carry an umbrella or light waterproof windcheater.`;
  } else if (lower.includes('safety') || lower.includes('risk') || lower.includes('பாதுகாப்பு')) {
    reply = `### 🛡️ Smart Road Risk: Low to Moderate
- **Kallar to Coonoor Ghat:** 36 Hairpin bends are clear. Daytime driving strongly recommended.
- **Fog Advisory:** Visibility drops after 6:30 PM near Aravankadu.
- **Tip:** You can start **Live Location Sharing** anytime in the Companion tab.`;
  } else {
    reply = language === 'ta'
      ? `வணக்கம்! நான் உங்கள் **TripPilot AI** உதவியாளர். உங்கள் சென்னை → ஊட்டி பயணத்தில் வழிகள், தங்குமிடம், வானிலை எச்சரிக்கைகள் மற்றும் அவசர உதவிகளுக்கு உதவத் தயாராக உள்ளேன். நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?`
      : `Hello! I am your **TripPilot AI** companion. I can help monitor your live route to Ooty, optimize your budget, check hospital/police contacts, or replan if rain hits. How can I help you today?`;
  }

  return {
    reply,
    actions: [],
    quickReplies,
    isDemoFallback: true,
  };
}

// ----------------------------------------------------------------------
// 7. Voice / Text Translator
// ----------------------------------------------------------------------
export async function translatePhrase(
  text: string,
  fromLang: string,
  toLang: string
): Promise<{ translation: string; pronunciation?: string; isDemoFallback: boolean }> {
  try {
    const data = await callServerApi('/api/gemini/translate', { text, fromLang, toLang });
    if (data.translation) {
      return {
        translation: data.translation,
        pronunciation: data.pronunciation || '',
        isDemoFallback: false,
      };
    }
  } catch {
    // fallback
  }

  const dict: Record<string, Record<string, string>> = {
    'Where is the hospital?': {
      ta: 'மருத்துவமனை எங்கே உள்ளது? (Maruthuvamanai engae ulladhu?)',
      hi: 'अस्पताल कहाँ है? (Aspataal kahan hai?)',
    },
    'How much does this cost?': {
      ta: 'இதன் விலை என்ன? (Idhan vilai enna?)',
      hi: 'यह कितने का है? (Yeh kitne ka hai?)',
    },
    'Please help me': {
      ta: 'தயவுசெய்து எனக்கு உதவுங்கள் (Thayavu seithu enakku udhavungal)',
      hi: 'कृपया मेरी मदद करें (Kripya meri madad karein)',
    },
    'Is this water safe to drink?': {
      ta: 'இந்த குடிநீர் பாதுகாப்பானதா? (Indha kudineer paadhukaappaanadha?)',
      hi: 'क्या यह पानी पीने के लिए सुरक्षित है? (Kya yeh paani peene ke liye surakshit hai?)',
    },
  };

  const match = dict[text]?.[toLang] || text;
  return {
    translation: match,
    isDemoFallback: true,
  };
}
