'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Truck, Loader2, Clock } from 'lucide-react';
import { applyAsSeller, applyAsDriver } from '@/actions/auth';

interface OnboardingContentProps {
    locale: string;
    role: 'seller' | 'driver';
    currentStatus?: 'pending' | 'approved' | 'rejected' | null;
}

export function OnboardingContent({ locale, role, currentStatus }: OnboardingContentProps) {
    const t = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(currentStatus === 'pending');

    const isSeller = role === 'seller';

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = isSeller
            ? await applyAsSeller(formData)
            : await applyAsDriver();

        if (result.success) {
            setApplied(true);
        } else {
            setError(result.error || 'Application failed');
        }
        setLoading(false);
    }

    // Already pending
    if (currentStatus === 'pending' || applied) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <CardTitle>{t('kyc.pending')}</CardTitle>
                        <CardDescription>{t('kyc.pendingMessage')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/buyer`}>
                            <Button variant="outline" className="w-full">
                                {locale === 'ar' ? 'تصفح كمشتري' : 'Browse as Buyer'}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Rejected
    if (currentStatus === 'rejected') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">❌</span>
                        </div>
                        <CardTitle>{t('kyc.rejected')}</CardTitle>
                        <CardDescription>{t('kyc.rejectedMessage')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href={`/${locale}/buyer/support`}>
                            <Button className="w-full">{t('support.support')}</Button>
                        </Link>
                        <Link href={`/${locale}/buyer`}>
                            <Button variant="outline" className="w-full">
                                {locale === 'ar' ? 'تصفح كمشتري' : 'Browse as Buyer'}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Application form
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {isSeller ? (
                            <Store className="h-8 w-8 text-primary" />
                        ) : (
                            <Truck className="h-8 w-8 text-primary" />
                        )}
                    </div>
                    <CardTitle>
                        {isSeller ? t('roles.becomeASeller') : t('roles.becomeADriver')}
                    </CardTitle>
                    <CardDescription>
                        {isSeller
                            ? (locale === 'ar' ? 'ابدأ بيع منتجاتك على سوق الأردن' : 'Start selling your products on JordanMarket')
                            : (locale === 'ar' ? 'انضم لفريق التوصيل واكسب دخلاً إضافياً' : 'Join our delivery team and earn extra income')
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        {isSeller && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">{t('kyc.businessName')}</Label>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        placeholder={locale === 'ar' ? 'اسم متجرك' : 'Your store name'}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">{t('kyc.businessAddress')}</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        placeholder={locale === 'ar' ? 'عنوان متجرك أو مخزنك' : 'Your store or warehouse address'}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}

                        {!isSeller && (
                            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                                {locale === 'ar'
                                    ? 'سيتم مراجعة طلبك من قبل فريقنا. قد نتواصل معك للحصول على مستندات إضافية.'
                                    : 'Your application will be reviewed by our team. We may contact you for additional documents.'}
                            </div>
                        )}

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
                                t('kyc.submitForReview')
                            )}
                        </Button>

                        <Link href={`/${locale}/buyer`}>
                            <Button variant="ghost" className="w-full">
                                {locale === 'ar' ? 'لاحقاً' : 'Maybe Later'}
                            </Button>
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
