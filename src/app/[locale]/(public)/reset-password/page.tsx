'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { requestPasswordReset } from '@/actions/auth';

export default function ResetPasswordPage() {
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
        formData.append('redirectTo', `${window.location.origin}/${locale}/reset-password/update`);
        const result = await requestPasswordReset(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed');
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.checkEmail')}</h2>
                        <p className="text-gray-500">{t('auth.resetEmailSent')}</p>
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
                        <h1 className="text-2xl font-bold text-gray-900">{t('auth.resetPassword')}</h1>
                        <p className="text-gray-500 mt-2">{t('auth.resetPasswordDescription')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            name="email"
                            type="email"
                            label={t('auth.email')}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            {t('auth.sendResetLink')}
                        </Button>
                    </form>

                    <p className="text-center text-gray-500 mt-6">
                        <Link href={`/${locale}/login`} className="text-primary-600 hover:text-primary-700">
                            ← {t('auth.backToLogin')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
