import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function LandingPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <LandingPageContent />;
}

function LandingPageContent() {
    const t = useTranslations();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
            {/* Navigation */}
            <nav className="px-6 py-4">
                <div className="mx-auto max-w-7xl flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                        {t('common.appName')}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-white/90 hover:text-white transition-colors"
                        >
                            {t('nav.login')}
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-2 bg-white text-indigo-900 rounded-full font-semibold hover:bg-white/90 transition-colors"
                        >
                            {t('nav.register')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="px-6 pt-20 pb-32">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            {t('landing.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 mb-4">
                            {t('landing.subtitle')}
                        </p>
                        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-12">
                            {t('landing.description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="px-8 py-4 bg-white text-indigo-900 rounded-full font-semibold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
                            >
                                {t('landing.cta.buyer')}
                            </Link>
                            <Link
                                href="/register"
                                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all hover:scale-105"
                            >
                                {t('landing.cta.seller')}
                            </Link>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-32 grid md:grid-cols-3 gap-8">
                        {/* COD Feature */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-8 h-8 text-green-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {t('landing.features.cod')}
                            </h3>
                            <p className="text-white/60">{t('landing.features.codDesc')}</p>
                        </div>

                        {/* Local Delivery Feature */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-8 h-8 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {t('landing.features.local')}
                            </h3>
                            <p className="text-white/60">{t('landing.features.localDesc')}</p>
                        </div>

                        {/* Secure Platform Feature */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-8 h-8 text-purple-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {t('landing.features.secure')}
                            </h3>
                            <p className="text-white/60">
                                {t('landing.features.secureDesc')}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-white/10">
                <div className="mx-auto max-w-7xl text-center text-white/40 text-sm">
                    © 2024 JordanMarket. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
