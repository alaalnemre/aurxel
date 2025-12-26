'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/lib/actions/orders';

const statusFlow: Record<string, string[]> = {
    placed: ['accepted'],
    accepted: ['preparing'],
    preparing: ['ready'],
    ready: [], // Driver picks up
};

const actionLabels: Record<string, { en: string; ar: string }> = {
    accepted: { en: 'Accept Order', ar: 'قبول الطلب' },
    preparing: { en: 'Start Preparing', ar: 'بدء التحضير' },
    ready: { en: 'Mark as Ready', ar: 'جاهز للتوصيل' },
};

export function OrderActions({
    orderId,
    currentStatus,
    locale,
}: {
    orderId: string;
    currentStatus: string;
    locale: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nextStatuses = statusFlow[currentStatus] || [];

    if (nextStatuses.length === 0) {
        if (currentStatus === 'ready') {
            return (
                <span className="text-sm text-secondary">
                    {locale === 'ar' ? 'بانتظار السائق' : 'Waiting for driver'}
                </span>
            );
        }
        return null;
    }

    const handleAction = async (newStatus: string) => {
        setLoading(true);
        setError(null);

        const result = await updateOrderStatus(orderId, newStatus);

        if (result.error) {
            setError(result.error);
        } else {
            router.refresh();
        }

        setLoading(false);
    };

    return (
        <div className="space-y-2">
            {error && (
                <p className="text-xs text-error">{error}</p>
            )}
            <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                    <button
                        key={status}
                        onClick={() => handleAction(status)}
                        disabled={loading}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading
                            ? (locale === 'ar' ? 'جاري...' : 'Loading...')
                            : actionLabels[status]?.[locale === 'ar' ? 'ar' : 'en'] || status}
                    </button>
                ))}
            </div>
        </div>
    );
}
