'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { submitSellerOnboarding } from '../../actions';

export default function SellerOnboardingPage() {
    const t = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setLoading(true);

        const result = await submitSellerOnboarding(formData);

        if (!result.success && result.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-white">
                        {t('common.appName')}
                    </Link>
                </div>

                {/* Onboarding Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-emerald-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('onboarding.seller.title')}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {t('onboarding.seller.subtitle')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="businessName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('onboarding.seller.businessName')} *
                            </label>
                            <input
                                id="businessName"
                                name="businessName"
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder={t('onboarding.seller.businessNamePlaceholder')}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="businessAddress"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('onboarding.seller.businessAddress')}
                            </label>
                            <input
                                id="businessAddress"
                                name="businessAddress"
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder={t('onboarding.seller.businessAddressPlaceholder')}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="businessPhone"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('onboarding.seller.businessPhone')}
                            </label>
                            <input
                                id="businessPhone"
                                name="businessPhone"
                                type="tel"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder="+962 7X XXX XXXX"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="businessDescription"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('onboarding.seller.businessDescription')}
                            </label>
                            <textarea
                                id="businessDescription"
                                name="businessDescription"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                                placeholder={t(
                                    'onboarding.seller.businessDescriptionPlaceholder'
                                )}
                            />
                        </div>

                        {/* Join Terms Checkbox */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    required
                                    className="mt-1 w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {t('onboarding.acceptTerms')}{' '}
                                    <a
                                        href="/join-terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:underline font-medium"
                                    >
                                        {t('onboarding.joinTermsLink')}
                                    </a>{' '}
                                    *
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? t('common.loading')
                                : t('onboarding.seller.submitApplication')}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        {t('onboarding.seller.reviewNote')}
                    </p>
                </div>
            </div>
        </div>
    );
}
