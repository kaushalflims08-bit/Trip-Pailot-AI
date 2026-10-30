export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
];

export const FALLBACK_INR_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.0118,
  EUR: 0.0109,
  GBP: 0.0093,
  AED: 0.0435,
  SGD: 0.0159,
  MYR: 0.0528,
  AUD: 0.0182,
  CAD: 0.0163,
  JPY: 1.82,
};

let cachedRates: Record<string, number> = { ...FALLBACK_INR_RATES };
let lastFetchTime = 0;

/**
 * Fetches real-time exchange rates from an open API (open.er-api.com) with secondary fallback
 */
export async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  // Cache for 10 minutes to respect open API limits
  if (now - lastFetchTime < 600000 && Object.keys(cachedRates).length > 2) {
    return cachedRates;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        cachedRates = { ...FALLBACK_INR_RATES, ...data.rates };
        lastFetchTime = now;
        return cachedRates;
      }
    }
  } catch (err) {
    console.warn('Primary open exchange rate API failed, trying secondary fallback...', err);
  }

  try {
    const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.rates) {
        cachedRates = { ...FALLBACK_INR_RATES, ...data2.rates };
        lastFetchTime = now;
        return cachedRates;
      }
    }
  } catch {
    // Both failed, return offline fallback
  }

  return cachedRates;
}

/**
 * Converts and formats an INR amount into the target currency
 */
export function convertInr(
  amountInInr: number,
  targetCurrency: string,
  rates: Record<string, number> = cachedRates
): { convertedAmount: number; formatted: string; symbol: string } {
  const meta = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrency) || SUPPORTED_CURRENCIES[0];
  const rate = rates[targetCurrency] || FALLBACK_INR_RATES[targetCurrency] || 1;

  const converted = amountInInr * rate;
  let formattedNumber = '';

  if (targetCurrency === 'INR') {
    formattedNumber = Math.round(converted).toLocaleString('en-IN');
  } else if (targetCurrency === 'JPY') {
    formattedNumber = Math.round(converted).toLocaleString();
  } else {
    // 2 decimals for USD, EUR, etc.
    formattedNumber = converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  return {
    convertedAmount: converted,
    formatted: `${meta.symbol}${formattedNumber}`,
    symbol: meta.symbol,
  };
}
