'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { approveSeller, rejectSeller, approveDriver, rejectDriver } from '@/actions/admin';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ApprovalButtonsProps {
    id: string;
    type: 'seller' | 'driver';
    locale: string;
}

export function ApprovalButtons({ id, type, locale }: ApprovalButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const t = {
        approve: locale === 'ar' ? 'موافقة' : 'Approve',
        reject: locale === 'ar' ? 'رفض' : 'Reject',
    };

    const handleApprove = () => {
        setError(null);
        startTransition(async () => {
            const result = type === 'seller'
                ? await approveSeller(id)
                : await approveDriver(id);

            if (!result.success) {
                setError(result.error || 'Failed to approve');
            } else {
                router.refresh();
            }
        });
    };

    const handleReject = () => {
        setError(null);
        startTransition(async () => {
            const result = type === 'seller'
                ? await rejectSeller(id)
                : await rejectDriver(id);

            if (!result.success) {
                setError(result.error || 'Failed to reject');
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-2">
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleApprove}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t.approve}
                        </>
                    )}
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleReject}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 mr-1" />
                            {t.reject}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
