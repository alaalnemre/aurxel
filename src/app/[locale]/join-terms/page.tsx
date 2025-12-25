import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const runtime = 'nodejs';

export default async function JoinTermsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('joinTerms');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Link
                        href="/"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4"
                    >
                        ← {t('backHome')}
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="mt-2 text-gray-600">{t('subtitle')}</p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-10">
                {/* General Terms */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        {t('general.title')}
                    </h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            {t('general.item1')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            {t('general.item2')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            {t('general.item3')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            {t('general.item4')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            {t('general.item5')}
                        </li>
                    </ul>
                </section>

                {/* Seller Terms */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        {t('seller.title')}
                    </h2>

                    <div className="space-y-6">
                        {/* Required Info */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">{t('seller.requiredInfo')}</h3>
                            <ul className="space-y-2 text-gray-700 ps-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    {t('seller.req1')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    {t('seller.req2')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    {t('seller.req3')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">✓</span>
                                    {t('seller.req4')}
                                </li>
                            </ul>
                        </div>

                        {/* Review Process */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">{t('seller.reviewProcess')}</h3>
                            <p className="text-gray-700">{t('seller.reviewDesc')}</p>
                        </div>

                        {/* Rejection Reasons */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h3 className="font-semibold text-amber-800 mb-2">{t('seller.rejectionReasons')}</h3>
                            <ul className="space-y-1 text-amber-700 text-sm">
                                <li>• {t('seller.reject1')}</li>
                                <li>• {t('seller.reject2')}</li>
                                <li>• {t('seller.reject3')}</li>
                                <li>• {t('seller.reject4')}</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Driver Terms */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        {t('driver.title')}
                    </h2>

                    <div className="space-y-6">
                        {/* Required Info */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">{t('driver.requiredInfo')}</h3>
                            <ul className="space-y-2 text-gray-700 ps-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    {t('driver.req1')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    {t('driver.req2')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    {t('driver.req3')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    {t('driver.req4')}
                                </li>
                            </ul>
                        </div>

                        {/* Review Process */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">{t('driver.reviewProcess')}</h3>
                            <p className="text-gray-700">{t('driver.reviewDesc')}</p>
                        </div>

                        {/* Rejection Reasons */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h3 className="font-semibold text-amber-800 mb-2">{t('driver.rejectionReasons')}</h3>
                            <ul className="space-y-1 text-amber-700 text-sm">
                                <li>• {t('driver.reject1')}</li>
                                <li>• {t('driver.reject2')}</li>
                                <li>• {t('driver.reject3')}</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Legal Notes */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        {t('legal.title')}
                    </h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            {t('legal.item1')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            {t('legal.item2')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            {t('legal.item3')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            {t('legal.item4')}
                        </li>
                    </ul>
                </section>

                {/* CTA */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-2">{t('cta.title')}</h2>
                    <p className="text-indigo-100 mb-6">{t('cta.subtitle')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            {t('cta.register')}
                        </Link>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-400 transition-colors"
                        >
                            {t('cta.home')}
                        </Link>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    {t('lastUpdated')}: {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </main>
        </div>
    );
}
