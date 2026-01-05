import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../globals.css';
import { locales } from '@/i18n';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
    title: 'MarketHub - Multi-Vendor Marketplace',
    description: 'Your trusted multi-vendor marketplace in Jordan',
};



export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;

    // Ensure that the incoming `locale` is valid
    if (!locales.includes(locale as 'en' | 'ar')) {
        notFound();
    }



    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages({ locale });

    // Determine text direction based on locale
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir}>
            <body className="antialiased">
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
                <SpeedInsights />
            </body>
        </html>
    );
}
