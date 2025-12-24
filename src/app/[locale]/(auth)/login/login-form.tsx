'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Loader2 } from 'lucide-react';
import { signIn } from '@/actions/auth';

interface LoginFormProps {
    locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
    const t = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        formData.append('locale', locale);

        const result = await signIn(formData);

        if (!result.success) {
            setError(result.error || 'Sign in failed');
            setLoading(false);
        }
        // If successful, signIn will redirect
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-4">
                        <Store className="h-8 w-8" />
                        <span className="text-2xl font-bold">{t('common.appName')}</span>
                    </Link>
                    <CardTitle>{t('auth.welcomeBack')}</CardTitle>
                    <CardDescription>{t('auth.signInToContinue')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">{t('auth.password')}</Label>
                                <Link
                                    href={`/${locale}/forgot-password`}
                                    className="text-sm text-primary hover:underline"
                                >
                                    {t('auth.forgotPassword')}
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
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
                                t('auth.signIn')
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">{t('auth.noAccount')} </span>
                        <Link href={`/${locale}/register`} className="text-primary hover:underline font-medium">
                            {t('auth.signUp')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
