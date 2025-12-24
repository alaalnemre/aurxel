'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { acceptDelivery, markPickedUp, markDelivered } from '@/actions/driver';
import { Check, Package, Truck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeliveryActionsProps {
    deliveryId: string;
    status: string;
    locale: string;
}

export function DeliveryActions({ deliveryId, status, locale }: DeliveryActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const t = {
        accept: locale === 'ar' ? 'قبول التوصيل' : 'Accept Delivery',
        pickedUp: locale === 'ar' ? 'تم الاستلام' : 'Picked Up',
        delivered: locale === 'ar' ? 'تم التوصيل' : 'Delivered',
    };

    const handleAction = (action: 'accept' | 'pickup' | 'deliver') => {
        setError(null);
        startTransition(async () => {
            let result;
            switch (action) {
                case 'accept':
                    result = await acceptDelivery(deliveryId);
                    break;
                case 'pickup':
                    result = await markPickedUp(deliveryId);
                    break;
                case 'deliver':
                    result = await markDelivered(deliveryId);
                    break;
            }

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

            {status === 'available' && (
                <Button
                    size="sm"
                    onClick={() => handleAction('accept')}
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

            {status === 'assigned' && (
                <Button
                    size="sm"
                    onClick={() => handleAction('pickup')}
                    disabled={isPending}
                    className="w-full"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Package className="h-4 w-4 mr-1" />
                            {t.pickedUp}
                        </>
                    )}
                </Button>
            )}

            {status === 'picked_up' && (
                <Button
                    size="sm"
                    onClick={() => handleAction('deliver')}
                    disabled={isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Truck className="h-4 w-4 mr-1" />
                            {t.delivered}
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
