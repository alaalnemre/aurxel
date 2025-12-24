import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
    children,
    params,
}: LocaleLayoutProps) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as 'en' | 'ar')) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Get messages for the current locale
    const messages = await getMessages();

    const isRTL = locale === 'ar';

    return (
        <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
            <body className={`min-h-screen bg-background font-sans antialiased ${isRTL ? 'rtl' : ''}`}>
                <NextIntlClientProvider messages={messages}>
                    {children}
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
