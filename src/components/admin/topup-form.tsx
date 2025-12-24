'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTopupCode, revokeTopupCode } from '@/actions/admin';
import { CreditCard, Plus, Loader2, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopupFormProps {
    locale: string;
}

export function TopupForm({ locale }: TopupFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const t = {
        generateCode: locale === 'ar' ? 'إنشاء كود' : 'Generate Code',
        amount: locale === 'ar' ? 'المبلغ' : 'Amount',
        generate: locale === 'ar' ? 'إنشاء' : 'Generate',
        codeGenerated: locale === 'ar' ? 'تم إنشاء الكود:' : 'Code generated:',
    };

    const handleSubmit = (formData: FormData) => {
        setError(null);
        setSuccess(null);

        const amount = parseFloat(formData.get('amount') as string);

        if (!amount || amount <= 0) {
            setError(locale === 'ar' ? 'أدخل مبلغ صحيح' : 'Enter a valid amount');
            return;
        }

        startTransition(async () => {
            const result = await generateTopupCode(amount);

            if (!result.success) {
                setError(result.error || 'Failed to generate code');
            } else {
                const data = result.data as { code: string };
                setSuccess(`${t.codeGenerated} ${data.code}`);
                router.refresh();
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    {t.generateCode}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Label htmlFor="amount">{t.amount} (QANZ)</Label>
                        <Input id="amount" name="amount" type="number" placeholder="100" min="1" step="0.01" />
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                {t.generate}
                            </>
                        )}
                    </Button>
                </form>
                {error && (
                    <p className="text-sm text-destructive mt-2">{error}</p>
                )}
                {success && (
                    <p className="text-sm text-green-600 mt-2 font-mono">{success}</p>
                )}
            </CardContent>
        </Card>
    );
}

interface RevokeButtonProps {
    codeId: string;
    locale: string;
}

export function RevokeButton({ codeId, locale }: RevokeButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRevoke = () => {
        startTransition(async () => {
            await revokeTopupCode(codeId);
            router.refresh();
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleRevoke}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                locale === 'ar' ? 'إلغاء' : 'Revoke'
            )}
        </Button>
    );
}

interface CopyCodeButtonProps {
    code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 hover:bg-muted rounded"
            title="Copy code"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
            )}
        </button>
    );
}
