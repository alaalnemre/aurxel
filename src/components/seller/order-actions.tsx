'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { acceptOrder, markOrderReady } from '@/actions/seller';
import { Check, Package, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderActionsProps {
    orderId: string;
    status: string;
    locale: string;
}

export function OrderActions({ orderId, status, locale }: OrderActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const t = {
        accept: locale === 'ar' ? 'قبول الطلب' : 'Accept Order',
        markReady: locale === 'ar' ? 'جاهز للتوصيل' : 'Mark Ready',
        processing: locale === 'ar' ? 'قيد التحضير' : 'Processing',
    };

    const handleAccept = () => {
        setError(null);
        startTransition(async () => {
            const result = await acceptOrder(orderId);
            if (!result.success) {
                setError(result.error || 'Failed');
            } else {
                router.refresh();
            }
        });
    };

    const handleMarkReady = () => {
        setError(null);
        startTransition(async () => {
            const result = await markOrderReady(orderId);
            if (!result.success) {
                setError(result.error || 'Failed');
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-2">
            {error && <p className="text-sm text-destructive">{error}</p>}

            {status === 'pending_seller' && (
                <Button
                    size="sm"
                    onClick={handleAccept}
                    disabled={isPending}
                    className="w-full"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Check className="h-4 w-4 mr-1" />
                            {t.accept}
                        </>
                    )}
                </Button>
            )}

            {status === 'preparing' && (
                <Button
                    size="sm"
                    onClick={handleMarkReady}
                    disabled={isPending}
                    className="w-full"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Package className="h-4 w-4 mr-1" />
                            {t.markReady}
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
