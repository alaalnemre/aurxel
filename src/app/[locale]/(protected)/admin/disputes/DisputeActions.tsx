'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { adminUpdateDisputeStatus } from '@/actions/disputes';

interface DisputeActionsProps {
    disputeId: string;
    status: string;
}

export function DisputeActions({ disputeId, status }: DisputeActionsProps) {
    const t = useTranslations();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (newStatus: string) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('disputeId', disputeId);
        formData.append('status', newStatus);
        await adminUpdateDisputeStatus(formData);
        router.refresh();
    };

    return (
        <div className="flex gap-2">
            {status === 'open' && (
                <Button size="sm" variant="outline" onClick={() => handleUpdate('investigating')} isLoading={isLoading}>
                    {t('admin.markInvestigating')}
                </Button>
            )}
            <Button size="sm" onClick={() => handleUpdate('resolved')} isLoading={isLoading}>
                {t('admin.markResolved')}
            </Button>
        </div>
    );
}
