import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DriverPendingPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <DriverPendingContent />;
}

function DriverPendingContent() {
    const t = useTranslations();

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Pending Icon */}
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-10 h-10 text-amber-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('onboarding.pending.title')}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {t('onboarding.pending.driverMessage')}
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-amber-800">
                            {t('onboarding.pending.reviewTime')}
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        {t('common.back')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
