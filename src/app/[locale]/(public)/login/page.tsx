'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginUser } from '@/actions/auth';

export default function LoginPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append('locale', locale);

        const result = await loginUser(formData);

        if (result.success && result.data) {
            router.push(result.data.redirectTo);
            router.refresh();
        } else {
            setError(result.error || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">J</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('common.appName')}</h1>
                        <p className="text-gray-500 mt-2">{t('auth.login')}</p>
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

                        <Input
                            name="password"
                            type="password"
                            label={t('auth.password')}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />

                        <div className="flex justify-end">
                            <Link href={`/${locale}/reset-password`} className="text-sm text-primary-600 hover:text-primary-700">
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            {t('auth.signIn')}
                        </Button>
                    </form>

                    <p className="text-center text-gray-500 mt-6">
                        {t('auth.noAccount')}{' '}
                        <Link href={`/${locale}/register`} className="text-primary-600 hover:text-primary-700 font-medium">
                            {t('auth.signUp')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
