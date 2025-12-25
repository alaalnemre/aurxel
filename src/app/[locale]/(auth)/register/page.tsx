'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { register } from '../actions';

export default function RegisterPage() {
    const t = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('buyer');

    async function handleSubmit(formData: FormData) {
        setError(null);
        setLoading(true);

        formData.set('role', selectedRole);

        const result = await register(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-white">
                        {t('common.appName')}
                    </Link>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('auth.register.title')}
                    </h1>
                    <p className="text-gray-600 mb-8">{t('auth.register.subtitle')}</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('auth.register.fullName')}
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                autoComplete="name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('auth.register.email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('auth.register.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                minLength={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t('auth.register.role')}
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('buyer')}
                                    className={`p-4 border-2 rounded-lg text-center transition-all ${selectedRole === 'buyer'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <svg
                                        className="w-8 h-8 mx-auto mb-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    <span className="font-medium">
                                        {t('auth.register.roleBuyer')}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('seller')}
                                    className={`p-4 border-2 rounded-lg text-center transition-all ${selectedRole === 'seller'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <svg
                                        className="w-8 h-8 mx-auto mb-2"
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
                                    <span className="font-medium">
                                        {t('auth.register.roleSeller')}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('common.loading') : t('auth.register.submit')}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            {t('auth.register.terms')}
                        </p>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        {t('auth.register.hasAccount')}{' '}
                        <Link
                            href="/login"
                            className="text-indigo-600 font-semibold hover:text-indigo-500"
                        >
                            {t('auth.register.login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
