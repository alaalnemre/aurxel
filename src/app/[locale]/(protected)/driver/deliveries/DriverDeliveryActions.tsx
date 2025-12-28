'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { driverAcceptDelivery, driverMarkPickedUp, driverMarkDelivered } from '@/actions/deliveries';

interface DriverDeliveryActionsProps {
    deliveryId: string;
    status: string;
    driverId: string;
}

export function DriverDeliveryActions({ deliveryId, status, driverId }: DriverDeliveryActionsProps) {
    const t = useTranslations();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: (formData: FormData) => Promise<{ success: boolean }>) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('deliveryId', deliveryId);
        await action(formData);
        router.refresh();
        setIsLoading(false);
    };

    if (status === 'available') {
        return <Button size="sm" onClick={() => handleAction(driverAcceptDelivery)} isLoading={isLoading}>{t('driver.acceptDelivery')}</Button>;
    }

    if (status === 'assigned') {
        return <Button size="sm" onClick={() => handleAction(driverMarkPickedUp)} isLoading={isLoading}>{t('driver.markPickedUp')}</Button>;
    }

    if (status === 'picked_up') {
        return <Button size="sm" onClick={() => handleAction(driverMarkDelivered)} isLoading={isLoading}>{t('driver.markDelivered')}</Button>;
    }

    return <span className="text-green-600 font-medium">✓ {t('driver.delivered')}</span>;
}
