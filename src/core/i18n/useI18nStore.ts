import { create } from 'zustand';
import { LanguageCode, LanguageOption, TranslationSchema, SUPPORTED_LANGUAGES } from './types';
import { es } from './locales/es';
import { en } from './locales/en';
import { pt } from './locales/pt';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { it } from './locales/it';
import { parseISODate, isToday, isYesterday } from '../utils/dateUtils';

const DICTIONARIES: Record<LanguageCode, TranslationSchema> = {
  es,
  en,
  pt,
  fr,
  de,
  it,
};

const LOCALE_MAP: Record<LanguageCode, string> = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
};

const LANGUAGE_STORAGE_KEY = 'tk_language_preference';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationSchema>;

function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'es';
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && saved in DICTIONARIES) {
    return saved as LanguageCode;
  }
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  if (browserLang && browserLang in DICTIONARIES) {
    return browserLang as LanguageCode;
  }
  return 'es';
}

function applyLanguageToDom(lang: LanguageCode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('lang', lang);
}

function getNestedTranslation(dict: any, keyPath: string): string | undefined {
  const parts = keyPath.split('.');
  let current = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`;
  });
}

interface I18nState {
  language: LanguageCode;
  supportedLanguages: LanguageOption[];
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatRelativeDate: (dateStr: string, format?: 'short' | 'long') => string;
  formatMonthName: (year: number, monthIndex: number) => string;
  formatFullDate: (dateStr: string) => string;
}

export const useI18nStore = create<I18nState>((set, get) => {
  const initial = getInitialLanguage();
  applyLanguageToDom(initial);

  return {
    language: initial,
    supportedLanguages: SUPPORTED_LANGUAGES,

    setLanguage: (lang: LanguageCode) => {
      if (!(lang in DICTIONARIES)) return;
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      applyLanguageToDom(lang);
      set({ language: lang });
    },

    t: (key: TranslationKey, params?: Record<string, string | number>) => {
      const currentLang = get().language;
      const dict = DICTIONARIES[currentLang] || DICTIONARIES.es;
      const template =
        getNestedTranslation(dict, key) ||
        getNestedTranslation(DICTIONARIES.es, key) ||
        key;
      return interpolate(template, params);
    },

    formatRelativeDate: (dateStr: string, format: 'short' | 'long' = 'short') => {
      const { language, t } = get();
      if (isToday(dateStr)) return t('common.today');
      if (isYesterday(dateStr)) return t('common.yesterday');

      const date = parseISODate(dateStr);
      const locale = LOCALE_MAP[language] || 'es-ES';
      const options: Intl.DateTimeFormatOptions =
        format === 'long'
          ? { weekday: 'long', day: 'numeric', month: 'long' }
          : { day: 'numeric', month: 'short' };

      const formatted = date.toLocaleDateString(locale, options);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    },

    formatMonthName: (year: number, monthIndex: number) => {
      const { language } = get();
      const locale = LOCALE_MAP[language] || 'es-ES';
      const date = new Date(year, monthIndex, 1);
      const name = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      return name.charAt(0).toUpperCase() + name.slice(1);
    },

    formatFullDate: (dateStr: string) => {
      const { language } = get();
      const locale = LOCALE_MAP[language] || 'es-ES';
      const date = parseISODate(dateStr);
      const formatted = date.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    },
  };
});
