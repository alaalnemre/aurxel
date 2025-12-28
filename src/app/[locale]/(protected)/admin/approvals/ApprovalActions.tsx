'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { adminApproveSeller, adminRejectSeller, adminApproveDriver, adminRejectDriver } from '@/actions/admin';

interface ApprovalActionsProps {
    type: 'seller' | 'driver';
    id: string;
}

export function ApprovalActions({ type, id }: ApprovalActionsProps) {
    const t = useTranslations();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(type === 'seller' ? 'sellerId' : 'driverId', id);
        await (type === 'seller' ? adminApproveSeller : adminApproveDriver)(formData);
        router.refresh();
    };

    const handleReject = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(type === 'seller' ? 'sellerId' : 'driverId', id);
        await (type === 'seller' ? adminRejectSeller : adminRejectDriver)(formData);
        router.refresh();
    };

    return (
        <div className="flex gap-2">
            <Button size="sm" onClick={handleApprove} isLoading={isLoading}>{t('admin.approve')}</Button>
            <Button size="sm" variant="danger" onClick={handleReject} disabled={isLoading}>{t('admin.reject')}</Button>
        </div>
    );
}
