'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redeemTopupCode } from '@/actions/buyer';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WalletRedeemFormProps {
    locale: string;
}

export function WalletRedeemForm({ locale }: WalletRedeemFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const t = {
        redeemCode: locale === 'ar' ? 'استخدام كود' : 'Redeem Code',
        codePlaceholder: locale === 'ar' ? 'أدخل الكود هنا' : 'Enter code here',
        redeem: locale === 'ar' ? 'تطبيق' : 'Apply',
        successMsg: locale === 'ar' ? 'تم إضافة' : 'Added',
        toWallet: locale === 'ar' ? 'للمحفظة' : 'to wallet',
    };

    const handleSubmit = (formData: FormData) => {
        setError(null);
        setSuccess(null);

        const code = formData.get('code') as string;

        if (!code || code.trim() === '') {
            setError(locale === 'ar' ? 'أدخل كود صحيح' : 'Enter a valid code');
            return;
        }

        startTransition(async () => {
            const result = await redeemTopupCode(code);

            if (!result.success) {
                setError(result.error || 'Failed to redeem code');
            } else {
                const data = result.data as { amount: number };
                setSuccess(`${t.successMsg} ${data.amount} QANZ ${t.toWallet}!`);
                router.refresh();
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t.redeemCode}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="flex gap-2">
                    <Input
                        name="code"
                        placeholder={t.codePlaceholder}
                        className="flex-1 font-mono uppercase"
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            t.redeem
                        )}
                    </Button>
                </form>
                {error && (
                    <p className="text-sm text-destructive mt-2">{error}</p>
                )}
                {success && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {success}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
