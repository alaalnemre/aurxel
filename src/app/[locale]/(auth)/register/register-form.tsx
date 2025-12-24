'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Loader2, CheckCircle } from 'lucide-react';
import { signUp } from '@/actions/auth';

interface RegisterFormProps {
    locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
    const t = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        formData.append('locale', locale);

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const result = await signUp(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Sign up failed');
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <CardTitle>{locale === 'ar' ? 'تم إنشاء الحساب!' : 'Account Created!'}</CardTitle>
                        <CardDescription>
                            {locale === 'ar'
                                ? 'تحقق من بريدك الإلكتروني لتأكيد حسابك'
                                : 'Check your email to confirm your account'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/login`}>
                            <Button className="w-full">{t('auth.signIn')}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-4">
                        <Store className="h-8 w-8" />
                        <span className="text-2xl font-bold">{t('common.appName')}</span>
                    </Link>
                    <CardTitle>{t('auth.createAccount')}</CardTitle>
                    <CardDescription>
                        {locale === 'ar'
                            ? 'انضم إلى سوق الأردن اليوم'
                            : 'Join JordanMarket today'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder={locale === 'ar' ? 'الاسم الكامل' : 'Your full name'}
                                required
                                autoComplete="name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('auth.email')}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('auth.password')}</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('common.loading')}
                                </>
                            ) : (
                                t('auth.signUp')
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">{t('auth.hasAccount')} </span>
                        <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
                            {t('auth.signIn')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
