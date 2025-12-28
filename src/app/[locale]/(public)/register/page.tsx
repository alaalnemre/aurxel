'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerUser } from '@/actions/auth';

export default function RegisterPage() {
    const t = useTranslations();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await registerUser(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Registration failed');
        }
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.checkEmail')}</h2>
                        <p className="text-gray-500">{t('auth.confirmEmail')}</p>
                        <Link href={`/${locale}/login`} className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
                            ← {t('auth.backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">J</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('common.appName')}</h1>
                        <p className="text-gray-500 mt-2">{t('auth.createAccount')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            name="fullName"
                            type="text"
                            label={t('auth.fullName')}
                            placeholder={t('auth.fullName')}
                            required
                        />

                        <Input
                            name="email"
                            type="email"
                            label={t('auth.email')}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />

                        <Input
                            name="password"
                            type="password"
                            label={t('auth.password')}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            minLength={6}
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            {t('auth.signUp')}
                        </Button>
                    </form>

                    <p className="text-center text-gray-500 mt-6">
                        {t('auth.haveAccount')}{' '}
                        <Link href={`/${locale}/login`} className="text-primary-600 hover:text-primary-700 font-medium">
                            {t('auth.signIn')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
