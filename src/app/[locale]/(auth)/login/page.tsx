'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { login } from '../actions';

export default function LoginPage() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setLoading(true);

        if (redirectTo) {
            formData.set('redirect', redirectTo);
        }

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-white">
                        {t('common.appName')}
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('auth.login.title')}
                    </h1>
                    <p className="text-gray-600 mb-8">{t('auth.login.subtitle')}</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                {t('auth.login.email')}
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
                                {t('auth.login.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                {t('auth.login.forgotPassword')}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('common.loading') : t('auth.login.submit')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        {t('auth.login.noAccount')}{' '}
                        <Link
                            href="/register"
                            className="text-indigo-600 font-semibold hover:text-indigo-500"
                        >
                            {t('auth.login.register')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
