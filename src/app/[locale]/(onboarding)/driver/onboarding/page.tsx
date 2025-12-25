'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { submitDriverOnboarding } from '../../actions';

export default function DriverOnboardingPage() {
    const t = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setLoading(true);

        const result = await submitDriverOnboarding(formData);

        if (!result.success && result.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-orange-800 flex items-center justify-center px-4 py-12">
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
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-orange-600"
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
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('onboarding.driver.title')}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {t('onboarding.driver.subtitle')}
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
                                htmlFor="vehicleType"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('onboarding.driver.vehicleType')} *
                            </label>
                            <select
                                id="vehicleType"
                                name="vehicleType"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            >
                                <option value="">{t('onboarding.driver.selectVehicle')}</option>
                                <option value="motorcycle">
                                    {t('onboarding.driver.motorcycle')}
                                </option>
                                <option value="car">{t('onboarding.driver.car')}</option>
                                <option value="van">{t('onboarding.driver.van')}</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="vehiclePlate"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('onboarding.driver.vehiclePlate')}
                            </label>
                            <input
                                id="vehiclePlate"
                                name="vehiclePlate"
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                placeholder={t('onboarding.driver.vehiclePlatePlaceholder')}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="licenseNumber"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('onboarding.driver.licenseNumber')}
                            </label>
                            <input
                                id="licenseNumber"
                                name="licenseNumber"
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                placeholder={t('onboarding.driver.licenseNumberPlaceholder')}
                            />
                        </div>

                        {/* Join Terms Checkbox */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    required
                                    className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {t('onboarding.acceptTerms')}{' '}
                                    <a
                                        href="/join-terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-orange-600 hover:underline font-medium"
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
                            className="w-full py-3 px-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? t('common.loading')
                                : t('onboarding.driver.submitApplication')}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        {t('onboarding.driver.reviewNote')}
                    </p>
                </div>
            </div>
        </div>
    );
}
