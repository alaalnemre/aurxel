// src/app/[locale]/layout.tsx
// Root layout for locale-specific pages with RTL/LTR support

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales, localeDirections, type Locale } from '@/i18n/config';
import '../globals.css';

export const metadata: Metadata = {
    title: 'JordanMarket',
    description: 'Your local marketplace in Jordan',
};

// Generate static params for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Get messages for the locale
    const messages = await getMessages();

    // Determine text direction
    const direction = localeDirections[locale as Locale];

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <body className="min-h-screen antialiased">
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
