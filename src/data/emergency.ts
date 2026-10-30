export interface EmergencyContactNumber {
  service: string;
  serviceTa: string;
  number: string;
  badge: string;
  desc: string;
  descTa: string;
}

export const EMERGENCY_NUMBERS: EmergencyContactNumber[] = [
  { service: 'National Emergency', serviceTa: 'தேசிய அவசர உதவி', number: '112', badge: 'All-in-One', desc: 'Police, Fire, Ambulance 24/7', descTa: 'காவல், தீயணைப்பு, ஆம்புலன்ஸ் அனைத்தும் ஒன்றில்' },
  { service: 'Ambulance / Medical', serviceTa: 'ஆம்புலன்ஸ் / அவசர சிகிச்சை', number: '108', badge: 'Free Gov', desc: 'State medical trauma response', descTa: 'அரசு அவசர மருத்துவ ஆம்புலன்ஸ் சேவை' },
  { service: 'Police', serviceTa: 'காவல்துறை', number: '100', badge: 'Emergency', desc: 'Law enforcement & immediate dispatch', descTa: 'உடனடி காவல் உதவி' },
  { service: 'Fire & Rescue', serviceTa: 'தீயணைப்பு & மீட்புப்பணி', number: '101', badge: 'Rescue', desc: 'Accident, flood and fire extraction', descTa: 'விபத்து மற்றும் தீ மீட்பு சேவை' },
  { service: 'Women Safety Helpline', serviceTa: 'பெண்கள் பாதுகாப்பு உதவி எண்', number: '1091', badge: 'Safety', desc: '24/7 women emergency response', descTa: '24 மணி நேர பெண்கள் பாதுகாப்பு பிரிவு' },
  { service: 'Child Helpline', serviceTa: 'குழந்தைகள் உதவி எண்', number: '1098', badge: 'Protection', desc: 'Child rescue & protection services', descTa: 'குழந்தைகள் பாதுகாப்பு மற்றும் மீட்பு' },
];

export interface SafeFacility {
  id: string;
  name: string;
  nameTa: string;
  type: 'hospital' | 'police';
  city: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  isOpen24Hours: boolean;
}

export const SAFE_FACILITIES: SafeFacility[] = [
  // Ooty & Nilgiris
  { id: 'hosp-ooty-gh', name: 'Government District Headquarters Hospital, Ooty', nameTa: 'அரசு தலைமை மருத்துவமனை, ஊட்டி', type: 'hospital', city: 'Ooty', phone: '0423-2442212', lat: 11.4110, lng: 76.7010, address: 'Hospital Road, Ooty, Nilgiris', isOpen24Hours: true },
  { id: 'hosp-ooty-sm', name: 'St. Mary’s Nursing Home', nameTa: 'செயின்ட் மேரிஸ் மருத்துவமனை', type: 'hospital', city: 'Ooty', phone: '0423-2443455', lat: 11.4050, lng: 76.6990, address: 'Commercial Road, Ooty', isOpen24Hours: true },
  { id: 'pol-ooty-town', name: 'Ooty Town Police Station B-1', nameTa: 'ஊட்டி டவுன் காவல் நிலையம்', type: 'police', city: 'Ooty', phone: '0423-2442222', lat: 11.4080, lng: 76.6970, address: 'Near Charing Cross, Ooty', isOpen24Hours: true },
  
  // Coonoor
  { id: 'hosp-coonoor-gh', name: 'Government Lawley Hospital, Coonoor', nameTa: 'அரசு லாவ்லி மருத்துவமனை, குன்னூர்', type: 'hospital', city: 'Coonoor', phone: '0423-2230230', lat: 11.3550, lng: 76.7990, address: 'Hospital Road, Coonoor', isOpen24Hours: true },
  { id: 'pol-coonoor', name: 'Coonoor Police Station', nameTa: 'குன்னூர் காவல் நிலையம்', type: 'police', city: 'Coonoor', phone: '0423-2230444', lat: 11.3520, lng: 76.7960, address: 'Mount Road, Coonoor', isOpen24Hours: true },

  // Mettupalayam (Ghat entry)
  { id: 'hosp-mtp-gh', name: 'Government Hospital, Mettupalayam', nameTa: 'அரசு மருத்துவமனை, மேட்டுப்பாளையம்', type: 'hospital', city: 'Mettupalayam', phone: '04254-222255', lat: 11.3005, lng: 76.9482, address: 'Ooty Main Road, Mettupalayam', isOpen24Hours: true },
  { id: 'pol-mtp', name: 'Mettupalayam Police Station', nameTa: 'மேட்டுப்பாளையம் காவல் நிலையம்', type: 'police', city: 'Mettupalayam', phone: '04254-222333', lat: 11.2980, lng: 76.9450, address: 'Coimbatore Road, Mettupalayam', isOpen24Hours: true },

  // Coimbatore
  { id: 'hosp-cbe-kmch', name: 'Kovai Medical Center and Hospital (KMCH)', nameTa: 'கோவை மெடிக்கல் சென்டர் மருத்துவமனை', type: 'hospital', city: 'Coimbatore', phone: '0422-4323800', lat: 11.0425, lng: 77.0345, address: 'Avinashi Road, Coimbatore', isOpen24Hours: true },
  { id: 'pol-cbe-central', name: 'Coimbatore Central Police Station', nameTa: 'கோவை மத்திய காவல் நிலையம்', type: 'police', city: 'Coimbatore', phone: '0422-2300061', lat: 11.0020, lng: 76.9650, address: 'Lanka Corner, Coimbatore', isOpen24Hours: true },

  // Chennai
  { id: 'hosp-chn-apollo', name: 'Apollo Hospitals Greams Road', nameTa: 'அப்பல்லோ மருத்துவமனை, சென்னை', type: 'hospital', city: 'Chennai', phone: '044-28290200', lat: 13.0604, lng: 80.2508, address: 'Greams Lane, Thousand Lights, Chennai', isOpen24Hours: true },
  { id: 'pol-chn-central', name: 'Chennai Central Railway Police Station', nameTa: 'சென்னை சென்ட்ரல் ரயில்வே காவல் நிலையம்', type: 'police', city: 'Chennai', phone: '044-25353535', lat: 13.0820, lng: 80.2750, address: 'Periyar EVR High Rd, Chennai', isOpen24Hours: true },
];

/**
 * Calculates Haversine distance in km between two lat/lng coordinates
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds nearest hospital and police station from current location
 */
export function getNearestFacilities(lat: number, lng: number) {
  const hospitals = SAFE_FACILITIES.filter(f => f.type === 'hospital').map(h => ({
    ...h,
    distanceKm: calculateHaversineDistance(lat, lng, h.lat, h.lng),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const policeStations = SAFE_FACILITIES.filter(f => f.type === 'police').map(p => ({
    ...p,
    distanceKm: calculateHaversineDistance(lat, lng, p.lat, p.lng),
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    nearestHospital: hospitals[0] || SAFE_FACILITIES[0],
    nearestPolice: policeStations[0] || SAFE_FACILITIES[2],
  };
}

export interface FirstAidGuideItem {
  id: string;
  titleEn: string;
  titleTa: string;
  stepsEn: string[];
  stepsTa: string[];
}

export const FIRST_AID_GUIDE: FirstAidGuideItem[] = [
  {
    id: 'cuts',
    titleEn: 'Cuts & Heavy Bleeding',
    titleTa: 'காயங்கள் மற்றும் கடுமையான இரத்தப்போக்கு',
    stepsEn: [
      'Apply direct, steady pressure using a clean cloth or bandage.',
      'Elevate the wounded limb above heart level if possible.',
      'Do not remove objects deeply embedded in the wound.',
      'Clean minor wounds with clean drinking water and apply antiseptic.',
      'Seek emergency medical help if bleeding does not stop after 10 minutes.'
    ],
    stepsTa: [
      'சுத்தமான துணி அல்லது கட்டுத்துணியால் காயத்தின் மேல் அழுத்திப் பிடிக்கவும்.',
      'முடிந்தால் காயம்பட்ட பகுதியை இதய மட்டத்திற்கு மேல் உயர்த்தவும்.',
      'காயத்தில் ஆழமாக பதிந்த பொருட்களை சுயமாக அகற்ற வேண்டாம்.',
      'தூய நீரால் கழுவி ஆன்டிசெப்டிக் களிம்பு இடவும்.',
      '10 நிமிடங்களுக்கு மேல் இரத்தம் நிற்காவிட்டால் உடனடியாக மருத்துவமனை செல்லவும்.'
    ]
  },
  {
    id: 'altitude',
    titleEn: 'Altitude & Motion Sickness (Ghats)',
    titleTa: 'மலைப்பாதை வாந்தி மற்றும் உயர மயக்கம்',
    stepsEn: [
      'Stop the vehicle immediately at a safe viewpoint or turnout.',
      'Look straight at the distant horizon, not at phone screens.',
      'Sip warm water or ginger tea slowly; avoid heavy or oily snacks.',
      'Loosen tight clothing around the neck and chest for deep breathing.'
    ],
    stepsTa: [
      'வாகனத்தை பாதுகாப்பான இடத்தில் உடனடியாக நிறுத்தவும்.',
      'செல்போன் திரையைப் பார்க்காமல் தூரத்து அடிவானத்தைப் பார்க்கவும்.',
      'வெதுவெதுப்பான நீர் அல்லது இஞ்சி டீ பருகவும்; காரமான உணவுகளைத் தவிர்க்கவும்.',
      'ஆழ்ந்து மூச்சு விட கழுத்து ஆடைகளை தளர்த்தவும்.'
    ]
  },
  {
    id: 'heat',
    titleEn: 'Heat Exhaustion & Dehydration',
    titleTa: 'வெப்ப மயக்கம் மற்றும் நீர்ச்சத்து குறைபாடு',
    stepsEn: [
      'Move the person into shade or an air-conditioned room immediately.',
      'Offer ORS (Oral Rehydration Solution) or coconut water slowly.',
      'Spray cool water on the face and neck; fan the skin.',
      'If vomiting continues or confusion occurs, rush to the nearest clinic.'
    ],
    stepsTa: [
      'நபரை உடனே நிழலான அல்லது குளிர்ந்த இடத்திற்கு மாற்றவும்.',
      'ORS கரைசல் அல்லது இளநீர் மெதுவாக பருகக் கொடுக்கவும்.',
      'முகம் மற்றும் கழுத்தில் குளிர்ந்த நீர் தெளித்து விசிறவும்.',
      'தொடர் வாந்தி அல்லது மயக்கம் ஏற்பட்டால் உடனடியாக மருத்துவமனைக்கு அழைத்துச் செல்லவும்.'
    ]
  },
  {
    id: 'sprain',
    titleEn: 'Sprains & Trekking Ankle Injury',
    titleTa: 'சுளுக்கு மற்றும் கணுக்கால் காயம் (R.I.C.E முறை)',
    stepsEn: [
      'Rest: Stop walking on the injured leg immediately.',
      'Ice: Apply cold water or ice pack wrapped in cloth for 15 mins.',
      'Compression: Wrap firmly with an elastic crepe bandage (not too tight).',
      'Elevation: Keep the foot elevated on a pillow or backpack.'
    ],
    stepsTa: [
      'ஓய்வு (Rest): காயமடைந்த காலில் நடப்பதை உடனே நிறுத்தவும்.',
      'பனி ஒத்தடம் (Ice): துணியில் சுற்றிய பனிக்கட்டியை 15 நிமிடம் வைக்கவும்.',
      'கட்டு (Compression): கிரெப் கட்டுத்துணியால் மிதமான இறுக்கத்துடன் கட்டவும்.',
      'உயர்த்துதல் (Elevation): பாதத்தை தலையணை அல்லது பேக் மீது உயர்த்தி வைக்கவும்.'
    ]
  }
];

export const MEDICAL_DISCLAIMER_EN = 'TripPilot AI does not provide medical diagnoses or prescriptions. For medical emergencies, always call 108 or 112 immediately.';
export const MEDICAL_DISCLAIMER_TA = 'TripPilot AI மருத்துவ பரிசோதனையோ பரிந்துரையோ வழங்குவதில்லை. அவசர மருத்துவ நிலைகளுக்கு எப்போதும் உடனடியாக 108 அல்லது 112-ஐ அழைக்கவும்.';
