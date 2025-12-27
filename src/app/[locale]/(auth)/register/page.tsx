'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signUp } from '@/lib/actions/auth';

export default function RegisterPage() {
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        // No role selection - all users start as buyers
        const result = await signUp(locale, formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href={`/${locale}`} className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                            <span className="text-white font-bold text-2xl">🛒</span>
                        </div>
                        <span className="font-bold text-2xl gradient-text">{tCommon('appName')}</span>
                    </Link>
                </div>

                <div className="card animate-fadeIn">
                    <h1 className="text-2xl font-bold text-center mb-2">{t('registerTitle')}</h1>
                    <p className="text-secondary text-center mb-6">{t('registerSubtitle')}</p>

                    {/* Unified Registration Notice */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">✨</span>
                            <div className="text-sm">
                                <p className="font-medium text-foreground">
                                    {locale === 'ar' ? 'ابدأ التسوق الآن!' : 'Start shopping right away!'}
                                </p>
                                <p className="text-muted-foreground mt-1">
                                    {locale === 'ar'
                                        ? 'يمكنك لاحقاً أن تصبح بائعاً أو سائقاً من لوحة التحكم الخاصة بك.'
                                        : 'You can become a seller or driver later from your dashboard.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
                                {t('fullName')}
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                required
                                className="w-full"
                                placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                                {t('phone')}
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="+962 7X XXX XXXX"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                                {t('password')}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                                {t('confirmPassword')}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                minLength={6}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-base"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {tCommon('loading')}
                                </span>
                            ) : (
                                t('signUp')
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-secondary">
                        {t('hasAccount')}{' '}
                        <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline">
                            {t('signIn')}
                        </Link>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                        <span>🔒</span>
                        <span>{locale === 'ar' ? 'آمن' : 'Secure'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>🇯🇴</span>
                        <span>{locale === 'ar' ? 'أردني' : 'Jordanian'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>💎</span>
                        <span>QANZ</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
