// src/i18n/index.ts
// Central export for i18n utilities

export { locales, defaultLocale, localeNames, localeDirections, isValidLocale } from './config';
export type { Locale } from './config';
export { routing } from './routing';
export { Link, redirect, usePathname, useRouter, getPathname } from './navigation';
