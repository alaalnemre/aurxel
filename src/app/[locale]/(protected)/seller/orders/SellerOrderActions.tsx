'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { sellerAcceptOrder, sellerMarkPreparing, sellerMarkReadyForPickup } from '@/actions/orders';

interface SellerOrderActionsProps {
    orderId: string;
    status: string;
}

export function SellerOrderActions({ orderId, status }: SellerOrderActionsProps) {
    const t = useTranslations();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: (formData: FormData) => Promise<{ success: boolean }>) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('orderId', orderId);
        await action(formData);
        router.refresh();
        setIsLoading(false);
    };

    if (status === 'placed') {
        return <Button size="sm" onClick={() => handleAction(sellerAcceptOrder)} isLoading={isLoading}>{t('seller.acceptOrder')}</Button>;
    }

    if (status === 'accepted') {
        return <Button size="sm" onClick={() => handleAction(sellerMarkPreparing)} isLoading={isLoading}>{t('seller.markPreparing')}</Button>;
    }

    if (status === 'preparing') {
        return <Button size="sm" onClick={() => handleAction(sellerMarkReadyForPickup)} isLoading={isLoading}>{t('seller.markReady')}</Button>;
    }

    return null;
}
