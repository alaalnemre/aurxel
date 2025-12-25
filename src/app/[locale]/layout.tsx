import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Geist, Geist_Mono } from 'next/font/google';
import { CartProvider } from '@/lib/cart/CartContext';
import '../globals.css';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as 'en' | 'ar')) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Get messages for the locale
    const messages = await getMessages();

    // Determine text direction
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
            >
                <NextIntlClientProvider messages={messages}>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
