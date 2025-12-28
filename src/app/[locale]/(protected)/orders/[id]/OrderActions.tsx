'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { buyerCancelOrder } from '@/actions/orders';
import { openDispute } from '@/actions/disputes';

interface OrderActionsProps {
    orderId: string;
    status: string;
    locale: string;
}

export function OrderActions({ orderId, status, locale }: OrderActionsProps) {
    const t = useTranslations();
    const router = useRouter();
    const [showDispute, setShowDispute] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const canCancel = status === 'placed';
    const canDispute = ['delivered', 'completed'].includes(status);

    const handleCancel = async () => {
        if (!confirm(t('orders.cancelConfirm'))) return;
        setIsLoading(true);
        const formData = new FormData();
        formData.append('orderId', orderId);
        await buyerCancelOrder(formData);
        router.refresh();
    };

    const handleDispute = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('orderId', orderId);
        const result = await openDispute(formData);
        if (result.success) {
            setShowDispute(false);
            router.refresh();
        }
        setIsLoading(false);
    };

    if (!canCancel && !canDispute) return null;

    return (
        <div className="flex gap-3">
            {canCancel && (
                <Button variant="danger" onClick={handleCancel} isLoading={isLoading}>
                    {t('orders.cancelOrder')}
                </Button>
            )}

            {canDispute && (
                <>
                    {!showDispute ? (
                        <Button variant="outline" onClick={() => setShowDispute(true)}>
                            {t('orders.openDispute')}
                        </Button>
                    ) : (
                        <form onSubmit={handleDispute} className="flex-1 space-y-3">
                            <Textarea name="reason" placeholder={t('orders.disputeReason')} required minLength={10} />
                            <div className="flex gap-2">
                                <Button type="submit" variant="danger" size="sm" isLoading={isLoading}>
                                    {t('common.submit')}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowDispute(false)}>
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    );
}
