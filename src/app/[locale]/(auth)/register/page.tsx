'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signUp } from '@/lib/actions/auth';

type Role = 'buyer' | 'seller' | 'driver';

export default function RegisterPage() {
    const params = useParams();
    const locale = params.locale as string;
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>('buyer');

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        formData.set('role', selectedRole);
        const result = await signUp(locale, formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    const roles: { value: Role; icon: string }[] = [
        { value: 'buyer', icon: '🛒' },
        { value: 'seller', icon: '🏪' },
        { value: 'driver', icon: '🛵' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href={`/${locale}`} className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">J</span>
                        </div>
                        <span className="font-bold text-2xl">{tCommon('appName')}</span>
                    </Link>
                </div>

                <div className="bg-card rounded-2xl p-8 shadow-card animate-fadeIn">
                    <h1 className="text-2xl font-bold text-center mb-2">{t('registerTitle')}</h1>
                    <p className="text-secondary text-center mb-6">{t('registerSubtitle')}</p>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">{t('selectRole')}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {roles.map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => setSelectedRole(role.value)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedRole === role.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <span className="text-2xl">{role.icon}</span>
                                    <span className="text-sm font-medium">{t(`${role.value}Role`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

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
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? tCommon('loading') : t('signUp')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-secondary">
                        {t('hasAccount')}{' '}
                        <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline">
                            {t('signIn')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
