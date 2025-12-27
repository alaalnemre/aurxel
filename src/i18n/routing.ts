// src/i18n/routing.ts
// next-intl routing configuration

import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix: 'always', // Always show locale prefix in URL (/en/..., /ar/...)
});
