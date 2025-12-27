import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Geist, Geist_Mono } from "next/font/google";
import { locales, type Locale } from '@/i18n/config';
import { CartProvider } from '@/lib/hooks/useCart';
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "JordanMarket - سوق الأردن",
    description: "Shop local, support Jordan. Your trusted Jordanian marketplace.",
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const messages = await getMessages();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const theme = localStorage.getItem('theme');
                                    const root = document.documentElement;
                                    if (theme === 'dark') {
                                        root.classList.add('dark');
                                        root.setAttribute('data-theme', 'dark');
                                    } else if (theme === 'light') {
                                        root.classList.remove('dark');
                                        root.setAttribute('data-theme', 'light');
                                    } else {
                                        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                        root.classList.toggle('dark', isDark);
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
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

