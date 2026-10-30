export interface FestivalOffer {
  id: string;
  name: string;
  nameTa: string;
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  badge: string;
  description: string;
  descriptionTa: string;
  startDate: string; // MM-DD
  endDate: string;   // MM-DD
}

export const FESTIVALS: FestivalOffer[] = [
  {
    id: 'pongal',
    name: 'Pongal Mega Harvest Special',
    nameTa: 'பொங்கல் சிறப்பு அறுவடை தள்ளுபடி',
    code: 'PONGALFEST',
    discountPercentage: 15,
    maxDiscount: 2500,
    badge: 'Popular in TN',
    description: 'Celebrate harvest season with exclusive discounts on Nilgiri & temple circuits!',
    descriptionTa: 'அறுவடை திருநாளை முன்னிட்டு நீலகிரி மற்றும் ஆன்மீக பயணங்களுக்கு 15% சிறப்பு தள்ளுபடி!',
    startDate: '01-05',
    endDate: '01-25',
  },
  {
    id: 'republic',
    name: 'Republic Day Long Weekend',
    nameTa: 'குடியரசு தின சிறப்பு சலுகை',
    code: 'REPUBLIC26',
    discountPercentage: 12,
    maxDiscount: 2000,
    badge: 'Long Weekend',
    description: 'Plan your patriotic long weekend getaway across South India.',
    descriptionTa: 'குடியரசு தின வார இறுதி விடுமுறையைக் கழிக்க 12% தள்ளுபடி.',
    startDate: '01-20',
    endDate: '01-31',
  },
  {
    id: 'diwali',
    name: 'Diwali Festival of Lights Sale',
    nameTa: 'தீபாவளி பண்டிகை சிறப்பு சலுகை',
    code: 'DIWALIJOY',
    discountPercentage: 20,
    maxDiscount: 3500,
    badge: 'Biggest Savings',
    description: 'Brighten your journeys with festive savings on family packages!',
    descriptionTa: 'குடும்ப தொகுப்புகளுக்கு ₹3,500 வரை 20% மாபெரும் தீபாவளி தள்ளுபடி!',
    startDate: '10-15',
    endDate: '11-15',
  },
  {
    id: 'independence',
    name: 'Freedom Getaway Special',
    nameTa: 'சுதந்திர தின விடுமுறை சலுகை',
    code: 'FREEDOM79',
    discountPercentage: 15,
    maxDiscount: 2000,
    badge: 'Monsoon Special',
    description: 'Take flight with monsoon savings on hill station retreats.',
    descriptionTa: 'மழைக்கால மலைவாசஸ்தல பயணங்களுக்கு 15% தள்ளுபடி.',
    startDate: '08-01',
    endDate: '08-20',
  },
  {
    id: 'christmas',
    name: 'Christmas & Winter Holidays',
    nameTa: 'கிறிஸ்துமஸ் & குளிர்கால சலுகை',
    code: 'XMASWINTER',
    discountPercentage: 18,
    maxDiscount: 3000,
    badge: 'Holiday Season',
    description: 'Celebrate year-end in misty Ooty, Kodaikanal, or sunny Pondicherry.',
    descriptionTa: 'ஊட்டி, கொடைக்கானல் குளிர்கால பயணங்களுக்கு 18% தள்ளுபடி.',
    startDate: '12-10',
    endDate: '12-28',
  },
  {
    id: 'newyear',
    name: 'New Year 2027 Bash',
    nameTa: 'புத்தாண்டு 2027 கொண்டாட்ட சலுகை',
    code: 'NEWYEAR27',
    discountPercentage: 20,
    maxDiscount: 4000,
    badge: 'Limited Time',
    description: 'Ring in the New Year with unforgettable adventures and live safety tracking.',
    descriptionTa: 'புத்தாண்டு பயணங்களுக்கு ₹4,000 வரை அதிரடி தள்ளுபடி.',
    startDate: '12-25',
    endDate: '01-05',
  },
];

/**
 * Returns currently active or nearest upcoming festival offer
 */
export function getActiveOrUpcomingFestival(): FestivalOffer {
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const mmdd = `${currentMonth}-${currentDay}`;

  // Find active
  const active = FESTIVALS.find(f => {
    if (f.startDate <= f.endDate) {
      return mmdd >= f.startDate && mmdd <= f.endDate;
    } else {
      // Over year boundary (e.g. 12-25 to 01-05)
      return mmdd >= f.startDate || mmdd <= f.endDate;
    }
  });

  if (active) return active;

  // Otherwise return the nearest upcoming or default to Diwali/Pongal
  return FESTIVALS[0];
}
