import { LanguageCode, Translations } from './types';
import { en } from './en';
import { ta } from './ta';
import { hi } from './hi';
import { te } from './te';
import { ml } from './ml';

export const translations: Record<LanguageCode, Translations> = {
  en,
  ta,
  hi,
  te,
  ml,
};

export const languages: { code: LanguageCode; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

export function getTranslation(lang: LanguageCode): Translations {
  return translations[lang] || translations.en;
}

export * from './types';
