// src/i18n/config.ts
// Internationalization configuration for JordanMarket

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
    en: 'English',
    ar: 'العربية',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
    en: 'ltr',
    ar: 'rtl',
};

export function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale);
}
