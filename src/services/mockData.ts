export interface Activity {
  time: string;
  title: string;
  titleTa?: string;
  location: string;
  lat: number;
  lng: number;
  type: 'transit' | 'sightseeing' | 'food' | 'nature' | 'adventure' | 'stay';
  estCost: number;
  notes: string;
  notesTa?: string;
  isCompleted?: boolean;
}

export interface DayItinerary {
  day: number;
  title: string;
  titleTa?: string;
  activities: Activity[];
  route: string;
  dayTotal: number;
}

export interface PackageOption {
  id: 'budget' | 'standard' | 'premium' | 'family';
  name: string;
  nameTa: string;
  price: number;
  transport: string;
  transportTa: string;
  hotel: string;
  hotelTa: string;
  meals: string;
  mealsTa: string;
  activities: string;
  activitiesTa: string;
  cancellation: string;
  cancellationTa: string;
  suitability: string;
  suitabilityTa: string;
  features: string[];
  featuresTa: string[];
  isRecommended?: boolean;
  recommendReason?: string;
  recommendReasonTa?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: 'Stay' | 'Transport' | 'Food' | 'Activities' | 'Emergency' | 'Miscellaneous';
  amount: number;
  paidBy?: string;
  date: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

// Fixed package pricing for 15,000 budget
export function generatePackagesForBudget(budget: number): PackageOption[] {
  const ratio = budget / 15000;
  const budgetPrice = Math.round(9800 * ratio);
  const standardPrice = Math.round(12400 * ratio);
  const premiumPrice = Math.round(16900 * ratio);
  const familyPrice = Math.round(14600 * ratio);

  return [
    {
      id: 'budget',
      name: 'Backpacker & Value Saver',
      nameTa: 'சிக்கன & மதிப்புமிக்க தொகுப்பு',
      price: budgetPrice,
      transport: 'Sleeper Train + Local Shared Cabs',
      transportTa: 'ஸ்லீப்பர் ரயில் + உள்ளூர் பகிர்வு வாடகை கார்',
      hotel: 'Cozy Homestay / Backpacker Hostel',
      hotelTa: 'இயற்கை எழில் கொஞ்சும் ஹோம்ஸ்டே',
      meals: 'Complimentary Local Breakfast',
      mealsTa: 'இலவச பாரம்பரிய காலை உணவு',
      activities: 'Entry tickets to Botanical Garden & Doddabetta',
      activitiesTa: 'தாவரவியல் பூங்கா & தொட்டபெட்டா நுழைவுச் சீட்டு',
      cancellation: 'Free cancellation up to 48 hours before',
      cancellationTa: '48 மணி நேரத்திற்கு முன் வரை இலவச ரத்து',
      suitability: 'Ideal for students, solo travelers, and smart budget planners',
      suitabilityTa: 'மாணவர்கள் மற்றும் சிக்கன பயணிகளுக்கு ஏற்றது',
      features: ['Clean certified sanitised rooms', '24/7 Hot water', 'Emergency SOS tracking assistance'],
      featuresTa: ['தூய்மை சான்றளிக்கப்பட்ட அறைகள்', '24/7 சுடுநீர் வசதி', 'அவசர SOS கண்காணிப்பு'],
    },
    {
      id: 'standard',
      name: 'Standard Explorer (Best Match)',
      nameTa: 'ஸ்டாண்டர்ட் எக்ஸ்ப்ளோரர் (சிறந்த தேர்வு)',
      price: standardPrice,
      transport: '3rd AC Nilgiri Express + Private Sedan Cab',
      transportTa: '3-ஆம் வகுப்பு ஏசி ரயில் + பிரைவேட் செடான் கார்',
      hotel: '3-Star Nilgiri Valley Resort (Breakfast incl.)',
      hotelTa: '3 நட்சத்திர நீலகிரி பள்ளத்தாக்கு ரிசார்ட்',
      meals: 'Breakfast + 1 Traditional South Indian Dinner',
      mealsTa: 'காலை உணவு + ஒரு பாரம்பரிய தென்னிந்திய இரவு விருந்து',
      activities: 'Toy Train Ticket + Tea Factory Guided Walk + Lake Boating',
      activitiesTa: 'மலை ரயில் டிக்கெட் + தேயிலை தொழிற்சாலை வழிகாட்டி உலா',
      cancellation: 'Free cancellation up to 24 hours before',
      cancellationTa: '24 மணி நேரத்திற்கு முன் வரை இலவச ரத்து',
      suitability: 'Perfect balance of comfort, scenic experiences, and peace of mind',
      suitabilityTa: 'வசதி மற்றும் அழகான அனுபவங்களின் சிறந்த சமநிலை',
      features: ['Dedicated private cab for 3 days', 'Heritage Toy Train confirmed seat', 'Real-time road risk & weather advisory'],
      featuresTa: ['3 நாட்களுக்கு பிரத்யேக கார்', 'மலை ரயில் உறுதி செய்யப்பட்ட இருக்கை', 'நேரலை வானிலை & சாலை எச்சரிக்கை'],
      isRecommended: true,
      recommendReason: 'Balances your ₹15,000 budget perfectly with private sightseeing and confirmed heritage train seats.',
      recommendReasonTa: 'உங்கள் ₹15,000 பட்ஜெட்டுக்குள் சிறந்த தனியார் கார் மற்றும் பாரம்பரிய ரயில் இருக்கைகளை வழங்குகிறது.',
    },
    {
      id: 'premium',
      name: 'Premium Heritage Comfort',
      nameTa: 'பிரீமியம் பாரம்பரிய சொகுசு தொகுப்பு',
      price: premiumPrice,
      transport: '2nd AC Nilgiri Express / Innova Crysta throughout',
      transportTa: '2-ஆம் வகுப்பு ஏசி ரயில் / இன்னோவா கிரிஸ்டா கார்',
      hotel: '4-Star Colonial Heritage Estate (Valley View Suite)',
      hotelTa: '4 நட்சத்திர பாரம்பரிய எஸ்டேட் அறை',
      meals: 'All Meals Included (Buffet Breakfast, Lunch & Candlelit Dinner)',
      mealsTa: 'அனைத்து உணவுகளும் அடங்கும் (காலை, மதிய & மெழுகுவர்த்தி இரவு உணவு)',
      activities: 'Private Tea Tasting Masterclass + VIP Lake Boating + Coonoor Private Tour',
      activitiesTa: 'பிரத்யேக தேயிலை சுவைத்தல் + விஐபி படகு சவாரி + குன்னூர் உலா',
      cancellation: 'Flexible anytime reschedule',
      cancellationTa: 'எப்போது வேண்டுமானாலும் தேதியை மாற்றிக்கொள்ளலாம்',
      suitability: 'Luxury seekers, honeymooners, and relaxed couples',
      suitabilityTa: 'தேனிலவு ஜோடிகள் மற்றும் சொகுசு விரும்பிகளுக்கு ஏற்றது',
      features: ['Chauffeur with certified mountain driving training', 'Bonfire with roasted marshmallows', 'Personal travel concierge'],
      featuresTa: ['மலைப்பாதை பயிற்சி பெற்ற ஓட்டுநர்', 'இரவு நேர கேம்ப்ஃபயர்', 'தனிப்பட்ட பயண உதவியாளர்'],
    },
    {
      id: 'family',
      name: 'Family Special Comfort',
      nameTa: 'குடும்ப சிறப்பு தொகுப்பு',
      price: familyPrice,
      transport: 'AC Train / Innova SUV with Child & Senior Assistance',
      transportTa: 'ஏசி ரயில் / இன்னோவா வாகனம் (முதியோர் வசதியுடன்)',
      hotel: 'Family Suite Villa with Garden & Kitchenette',
      hotelTa: 'தோட்டத்துடன் கூடிய குடும்ப வில்லா அறை',
      meals: 'Breakfast & Kid-Friendly Custom Meals',
      mealsTa: 'காலை உணவு மற்றும் குழந்தைகள் விரும்பும் உணவுகள்',
      activities: 'Rose Garden + Botanical Walk + Wax Museum + Honey & Bee Museum',
      activitiesTa: 'ரோஜா பூங்கா + மெழுகு சிலை அருங்காட்சியகம் + தேனீ அருங்காட்சியகம்',
      cancellation: 'Free cancellation up to 48 hours before',
      cancellationTa: '48 மணி நேரத்திற்கு முன் வரை இலவச ரத்து',
      suitability: 'Families with children or elderly grandparents',
      suitabilityTa: 'குழந்தைகள் மற்றும் முதியவர்களுடன் பயணிக்கும் குடும்பங்களுக்கு சிறந்தது',
      features: ['Child car seats available on request', 'First aid & doctor-on-call facility', 'Low-walking comfortable route itinerary'],
      featuresTa: ['குழந்தைகளுக்கான பாதுகாப்பு இருக்கை', 'மருத்துவ உதவி வசதி', 'அதிகம் நடக்கத் தேவையில்லாத எளிய பாதை'],
    },
  ];
}

// Demo 3-day Chennai -> Ooty Itinerary
export const DEMO_OOTY_ITINERARY: DayItinerary[] = [
  {
    day: 1,
    title: 'Scenic Foothills, Nilgiri Mountain Railway & Ooty Arrival',
    titleTa: 'அடிவாரம், நீலகிரி பாரம்பரிய மலை ரயில் மற்றும் ஊட்டி வருகை',
    route: 'Chennai Central → Mettupalayam (Nilgiri Express) → Coonoor/Ooty by Toy Train',
    dayTotal: 4200,
    activities: [
      {
        time: '06:15 AM',
        title: 'Arrive at Mettupalayam Railway Station',
        titleTa: 'மேட்டுப்பாளையம் ரயில் நிலையம் வருகை',
        location: 'Mettupalayam Station',
        lat: 11.3005,
        lng: 76.9482,
        type: 'transit',
        estCost: 0,
        notes: 'Alight from 12671 Nilgiri Superfast Express. Fresh mountain air and hot filter coffee at station stall.',
        notesTa: 'நீலகிரி எக்ஸ்பிரஸ் ரயிலில் இருந்து இறங்குதல். சூடான ஃபில்டர் காபி.',
        isCompleted: true,
      },
      {
        time: '07:10 AM',
        title: 'Board UNESCO Heritage Toy Train to Coonoor & Ooty',
        titleTa: 'யுனெஸ்கோ பாரம்பரிய மலை ரயிலில் பயணம்',
        location: 'Nilgiri Mountain Railway',
        lat: 11.3250,
        lng: 76.8500,
        type: 'transit',
        estCost: 650,
        notes: 'Chugging steam engine along 16 tunnels and 250 bridges across misty waterfalls.',
        notesTa: '16 குகைகள் மற்றும் 250 பாலங்கள் வழியே செல்லும் நீராவி என்ஜின் மலை ரயில்.',
        isCompleted: true,
      },
      {
        time: '12:30 PM',
        title: 'Check-in & Traditional Badaga / South Indian Lunch',
        titleTa: 'ஹோட்டல் செக்-இன் மற்றும் பாரம்பரிய மதிய உணவு',
        location: 'Nilgiri Valley Resort, Ooty',
        lat: 11.4102,
        lng: 76.6950,
        type: 'stay',
        estCost: 1800,
        notes: 'Unpack, freshen up with eucalyptus hot towels and relish steaming hot curd rice & potato roast.',
        notesTa: 'அறையில் ஓய்வு எடுத்து சுவையான தென்னிந்திய உணவு உட்கொள்ளுதல்.',
        isCompleted: false,
      },
      {
        time: '03:30 PM',
        title: 'Explore Government Botanical Garden',
        titleTa: 'அரசு தாவரவியல் பூங்கா உலா',
        location: 'Vannarapettai, Ooty',
        lat: 11.4180,
        lng: 76.7110,
        type: 'nature',
        estCost: 450,
        notes: 'Wander through 55 acres of terraced exotic flora, Italian garden, and the 20-million-year-old fossilized tree.',
        notesTa: '55 ஏக்கர் பரப்பளவில் அமைந்துள்ள அரிய வகை மலர்கள் மற்றும் இத்தாலிய தோட்டம்.',
        isCompleted: false,
      },
      {
        time: '05:45 PM',
        title: 'Sunset Boating at Ooty Lake & Homemade Chocolates',
        titleTa: 'ஊட்டி ஏரியில் சூரிய அஸ்தமன படகு சவாரி & சாக்லேட்',
        location: 'Ooty Lake',
        lat: 11.4070,
        lng: 76.6850,
        type: 'sightseeing',
        estCost: 1300,
        notes: 'Calm pedal boating with eucalyptus backdrop; sample warm fudge and hazelnut chocolates on Charing Cross road.',
        notesTa: 'ஊட்டி ஏரியில் படகு சவாரி மற்றும் சுவையான ஹோம்மேட் சாக்லேட் வாங்குதல்.',
        isCompleted: false,
      },
    ],
  },
  {
    day: 2,
    title: 'High Peaks, Tea Plantations & Emerald Lake Serenity',
    titleTa: 'தொட்டபெட்டா சிகரம், தேயிலை தோட்டங்கள் மற்றும் எமரால்டு ஏரி',
    route: 'Ooty Town → Doddabetta Peak → Tea Factory → Emerald Lake',
    dayTotal: 4900,
    activities: [
      {
        time: '08:30 AM',
        title: 'Ascend to Doddabetta Peak (2,637 m)',
        titleTa: 'தொட்டபெட்டா சிகரம் (2,637 மீ) பார்வை',
        location: 'Doddabetta Viewpoint',
        lat: 11.4014,
        lng: 76.7360,
        type: 'sightseeing',
        estCost: 350,
        notes: 'Highest point in the Nilgiris; panoramic telescope house view over the misty Coimbatore plains and Nilgiri ranges.',
        notesTa: 'நீலகிரியின் மிக உயரமான சிகரம். தொலைநோக்கி மூலம் கண்கவர் இயற்கை காட்சி.',
        isCompleted: false,
      },
      {
        time: '11:00 AM',
        title: 'Dodabetta Tea Factory & Chocolate Museum Tour',
        titleTa: 'தேயிலை தொழிற்சாலை மற்றும் சாக்லேட் அருங்காட்சியகம்',
        location: 'Kotagiri Road, Ooty',
        lat: 11.4085,
        lng: 76.7290,
        type: 'food',
        estCost: 400,
        notes: 'Watch fresh tea leaves withering, crushing and drying into aromatic CTC tea, followed by hot cardamom tea samples.',
        notesTa: 'தேயிலை தூள் தயாரிக்கும் நேரடி செயல்முறை மற்றும் சூடான ஏலக்காய் டீ சுவைத்தல்.',
        isCompleted: false,
      },
      {
        time: '01:30 PM',
        title: 'Scenic Drive & Picnic Lunch at Emerald Lake',
        titleTa: 'எமரால்டு ஏரி இயற்கை பயணம் மற்றும் மதிய உணவு',
        location: 'Emerald Lake & Dam',
        lat: 11.3315,
        lng: 76.6210,
        type: 'nature',
        estCost: 1500,
        notes: 'Far from crowds, surrounded by silent pine forests and tea slopes. Perfect for photography and tranquility.',
        notesTa: 'கூட்டம் இல்லாத அமைதியான பைன் காடுகள் சூழ்ந்த ஏரி. புகைப்படம் எடுக்க அருமையான இடம்.',
        isCompleted: false,
      },
      {
        time: '04:30 PM',
        title: 'Pykara Lake Speedboating & Waterfalls',
        titleTa: 'பைகாரா ஏரி வேக படகு சவாரி & நீர்வீழ்ச்சி',
        location: 'Pykara',
        lat: 11.4550,
        lng: 76.5980,
        type: 'adventure',
        estCost: 1150,
        notes: 'Thrilling motor boat cruise over pristine waters, sacred to the indigenous Toda community.',
        notesTa: 'பைகாரா ஆற்றில் வேக படகு சவாரி மற்றும் நீர்வீழ்ச்சி பார்வை.',
        isCompleted: false,
      },
      {
        time: '08:00 PM',
        title: 'Campfire with Roasted Corn & Badaga Tribal Soup',
        titleTa: 'கேம்ப்ஃபயர் மற்றும் சுவையான இரவு உணவு',
        location: 'Resort Lawn',
        lat: 11.4102,
        lng: 76.6950,
        type: 'food',
        estCost: 1500,
        notes: 'Cozy evening by the warm crackling fire under star-studded Nilgiri skies.',
        notesTa: 'குளிருக்கு இதமான கேம்ப்ஃபயர் மற்றும் சூடான படுகா சூப்.',
        isCompleted: false,
      },
    ],
  },
  {
    day: 3,
    title: 'Coonoor Sim’s Park, Dolphin’s Nose & Farewell Descent',
    titleTa: 'குன்னூர் சிம்ஸ் பார்க், டால்பின்ஸ் நோஸ் மற்றும் ஊர் திரும்புதல்',
    route: 'Ooty → Coonoor (Sim’s Park & Dolphin’s Nose) → Mettupalayam / Coimbatore',
    dayTotal: 3300,
    activities: [
      {
        time: '09:00 AM',
        title: 'Visit Sim’s Park, Coonoor',
        titleTa: 'சிம்ஸ் பார்க், குன்னூர் பார்வை',
        location: 'Coonoor, Nilgiris',
        lat: 11.3550,
        lng: 76.7990,
        type: 'nature',
        estCost: 300,
        notes: 'Unusual botanical garden landscaped along a natural ravine with over 1,000 plant species.',
        notesTa: 'இயற்கை பள்ளத்தாக்கில் அமைக்கப்பட்ட 1,000-க்கும் மேற்பட்ட தாவர வகைகள் கொண்ட பார்க்.',
        isCompleted: false,
      },
      {
        time: '11:30 AM',
        title: 'Dolphin’s Nose Viewpoint & Catherine Falls Panorama',
        titleTa: 'டால்பின்ஸ் நோஸ் பார்வை மற்றும் கேத்தரின் நீர்வீழ்ச்சி',
        location: 'Dolphin’s Nose, Coonoor',
        lat: 11.3280,
        lng: 76.8410,
        type: 'sightseeing',
        estCost: 200,
        notes: 'Enormous cliff rock resembling a dolphin nose, offering views of the roaring Catherine Falls across the chasm.',
        notesTa: 'டால்பின் மூக்கு போன்ற பிரம்மாண்ட பாறை முகடு மற்றும் கேத்தரின் நீர்வீழ்ச்சி காட்சி.',
        isCompleted: false,
      },
      {
        time: '01:30 PM',
        title: 'Authentic Nilgiri Thali Lunch in Coonoor',
        titleTa: 'குன்னூரில் பாரம்பரிய நீலகிரி வாழை இலை சாப்பாடு',
        location: 'Mount Road, Coonoor',
        lat: 11.3530,
        lng: 76.7959,
        type: 'food',
        estCost: 800,
        notes: 'Hot rice, sambar, beetroot poriyal, cabbage kootu, rasam, and fresh payasam.',
        notesTa: 'சுவையான சூடான சாம்பார் சாதம், பொரியல், ரசம் மற்றும் பாயாசம்.',
        isCompleted: false,
      },
      {
        time: '04:00 PM',
        title: 'Scenic Ghat Descent via Mettupalayam (Kotagiri route)',
        titleTa: 'கோத்தகிரி வழி மேட்டுப்பாளையம் பாதுகாப்பான இறக்கம்',
        location: 'Kotagiri Ghat Road',
        lat: 11.3500,
        lng: 76.9000,
        type: 'transit',
        estCost: 1000,
        notes: 'Smooth, scenic alternative route bypassing heavy truck traffic with misty tea views.',
        notesTa: 'போக்குவரத்து நெரிசல் இல்லாத மாற்றுப் பாதை வழியே பாதுகாப்பான இறக்கம்.',
        isCompleted: false,
      },
      {
        time: '07:30 PM',
        title: 'Board Evening Return Express to Chennai',
        titleTa: 'சென்னை திரும்பும் எக்ஸ்பிரஸ் ரயிலில் ஏறுதல்',
        location: 'Mettupalayam / Coimbatore Jn',
        lat: 11.0020,
        lng: 76.9650,
        type: 'transit',
        estCost: 1000,
        notes: 'Board 12672 Nilgiri SF Express for overnight journey back to Chennai Central. Arrives 05:00 AM next morning.',
        notesTa: 'சென்னை சென்ட்ரல் திரும்பும் இரவு நேர எக்ஸ்பிரஸ் ரயில் பயணம்.',
        isCompleted: false,
      },
    ],
  },
];

// Preloaded Demo Expenses
export const DEMO_EXPENSES: ExpenseItem[] = [
  { id: 'exp-1', title: 'Nilgiri Express 3AC Tickets (2 pax)', category: 'Transport', amount: 2400, paidBy: 'Karthik', date: '2026-10-28' },
  { id: 'exp-2', title: 'Nilgiri Valley Resort (Advance)', category: 'Stay', amount: 4500, paidBy: 'Karthik', date: '2026-10-28' },
  { id: 'exp-3', title: 'Heritage Toy Train Tickets', category: 'Activities', amount: 650, paidBy: 'Priya', date: '2026-10-29' },
  { id: 'exp-4', title: 'Botanical Garden & Doddabetta Entry', category: 'Activities', amount: 800, paidBy: 'Karthik', date: '2026-10-29' },
  { id: 'exp-5', title: 'Ooty Lake Boating & Chocolates', category: 'Food', amount: 1300, paidBy: 'Priya', date: '2026-10-29' },
  { id: 'exp-6', title: 'Local Tea & Snacks', category: 'Food', amount: 450, paidBy: 'Priya', date: '2026-10-30' },
];

// Mock Transport Tabs Data
export const MOCK_FLIGHTS = [
  { id: '6E-452', airline: 'IndiGo', from: 'MAA (Chennai)', to: 'CJB (Coimbatore)', depart: '06:30', arrive: '07:45', duration: '1h 15m', price: 3450, stops: 'Non-stop', rating: 4.6 },
  { id: 'AI-582', airline: 'Air India', from: 'MAA (Chennai)', to: 'CJB (Coimbatore)', depart: '10:15', arrive: '11:35', duration: '1h 20m', price: 4100, stops: 'Non-stop', rating: 4.4 },
  { id: 'QP-1304', airline: 'Akasa Air', from: 'MAA (Chennai)', to: 'CJB (Coimbatore)', depart: '15:40', arrive: '16:55', duration: '1h 15m', price: 3200, stops: 'Non-stop', rating: 4.5 },
  { id: '6E-991', airline: 'IndiGo', from: 'MAA (Chennai)', to: 'CJB (Coimbatore)', depart: '20:10', arrive: '21:25', duration: '1h 15m', price: 3680, stops: 'Non-stop', rating: 4.6 },
];

export const MOCK_TRAINS = [
  { id: '12671', name: 'Nilgiri Superfast Express', from: 'Chennai Central (MAS)', to: 'Mettupalayam (MTP)', depart: '21:05', arrive: '06:15', duration: '9h 10m', classes: ['1A', '2A', '3A', 'SL'], avail: 'AVAILABLE - 42 (3A)', price: 1180, punctuality: '96%' },
  { id: '20643', name: 'Coimbatore Vande Bharat Express', from: 'Chennai Central (MAS)', to: 'Coimbatore Jn (CBE)', depart: '06:00', arrive: '11:50', duration: '5h 50m', classes: ['CC', 'EC'], avail: 'AVAILABLE - 18 (CC)', price: 1420, punctuality: '99%' },
  { id: '12675', name: 'Kovai Superfast Express', from: 'Chennai Central (MAS)', to: 'Coimbatore Jn (CBE)', depart: '07:10', arrive: '14:50', duration: '7h 40m', classes: ['CC', '2S'], avail: 'AVAILABLE - 88 (CC)', price: 685, punctuality: '94%' },
  { id: '12673', name: 'Cheran Superfast Express', from: 'Chennai Central (MAS)', to: 'Coimbatore Jn (CBE)', depart: '22:00', arrive: '06:00', duration: '8h 00m', classes: ['1A', '2A', '3A', 'SL'], avail: 'RAC 4 (3A)', price: 1050, punctuality: '95%' },
];

export const MOCK_BUSES = [
  { id: 'bus-1', operator: 'KSRTC Airavat Club Class Multi-Axle', type: 'AC Semi-Sleeper (2+2)', depart: '21:30', arrive: '07:15', price: 1050, seats: 14, rating: 4.8 },
  { id: 'bus-2', operator: 'SETC Ultra Deluxe AC', type: 'AC Seater (2+2)', depart: '20:45', arrive: '06:50', price: 780, seats: 22, rating: 4.3 },
  { id: 'bus-3', operator: 'Parveen Travels Mercedes Benz', type: 'AC Sleeper (2+1)', depart: '22:15', arrive: '07:45', price: 1350, seats: 8, rating: 4.7 },
  { id: 'bus-4', operator: 'Greenline Travels Multi-Axle Volvo', type: 'AC Sleeper (2+1)', depart: '21:00', arrive: '06:30', price: 1280, seats: 11, rating: 4.6 },
];

export const MOCK_HOTELS = [
  { id: 'hot-1', name: 'Sterling Ooty Fern Hill', location: 'Fern Hill, Ooty', rating: 4.6, reviews: 1420, price: 4200, origPrice: 5800, amenities: ['Valley View', 'Free Breakfast', 'Bonfire', 'Spa'], image: 'from-emerald-700 to-teal-900' },
  { id: 'hot-2', name: 'Savoy - IHCL SeleQtions', location: 'Sylks Road, Ooty', rating: 4.9, reviews: 980, price: 9500, origPrice: 12500, amenities: ['Colonial Architecture', 'Fine Dining', 'Heated Rooms', 'Heritage Garden'], image: 'from-amber-700 to-stone-900' },
  { id: 'hot-3', name: 'Hotel Tamil Nadu TTDC Ooty', location: 'Charing Cross, Ooty', rating: 4.2, reviews: 2100, price: 2100, origPrice: 2800, amenities: ['Govt Certified', 'Ample Parking', 'Vegetarian Restaurant', 'Hot Water'], image: 'from-blue-700 to-slate-900' },
  { id: 'hot-4', name: 'Zostel Ooty', location: 'Fern Hill, Ooty', rating: 4.7, reviews: 1850, price: 999, origPrice: 1400, amenities: ['Backpacker Vibe', 'Common Room', 'Cafe', 'High Speed Wi-Fi'], image: 'from-orange-600 to-rose-900' },
];

// Preloaded Safety Checklist
export const DEMO_SAFETY_CHECKLIST = [
  { id: 'sc-1', label: 'Save local emergency numbers: 112, 108 & Ooty GH (0423-2442212)', completed: true },
  { id: 'sc-2', label: 'Download offline district map & emergency first aid instructions', completed: true },
  { id: 'sc-3', label: 'Check Nilgiri ghat weather & landslide safety status', completed: true },
  { id: 'sc-4', label: 'Inform trusted contacts and enable live location sharing', completed: false },
  { id: 'sc-5', label: 'Pack warm woolen attire, thermal layer & motion sickness meds for hairpin bends', completed: true },
];

// Preloaded Weather & Road Condition
export const DEMO_WEATHER_ADVISORY = {
  destination: 'Ooty (Udhagamandalam)',
  temperature: '14°C - 21°C',
  weatherSummary: 'Cool, partly cloudy with gentle evening mist',
  weatherSummaryTa: 'குளிரான வானிலை, பகுதி மேகமூட்டம் மற்றும் மாலை பனிமூட்டம்',
  airQualityIndex: 'Good (AQI 28)',
  landslideRisk: 'Low',
  ghatCondition: 'Clear & Open (36 Hairpin Kallar-Coonoor route operating normally)',
  crowdLevel: 'Moderate (Weekend rush expected at Botanical Garden)',
  festivalNotice: 'Deepavali winter floral displays open at Sim’s Park',
};
