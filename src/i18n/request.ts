// src/i18n/request.ts
// next-intl request configuration for App Router

import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
    // Get the locale from the request
    const requested = await requestLocale;

    // Validate and fallback to default if invalid
    const locale = hasLocale(locales, requested) ? requested : defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
