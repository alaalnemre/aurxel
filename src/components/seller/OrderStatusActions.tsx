'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { updateOrderStatus } from '@/lib/orders/actions';
import type { OrderStatus } from '@/lib/types/database';

interface OrderStatusActionsProps {
    orderId: string;
    currentStatus: OrderStatus;
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
        placed: 'accepted',
        accepted: 'preparing',
        preparing: 'ready_for_pickup',
    };

    const nextStatus = nextStatusMap[currentStatus];
    const canCancel = ['placed', 'accepted'].includes(currentStatus);

    async function handleStatusUpdate(newStatus: OrderStatus) {
        setError(null);
        setLoading(true);

        const result = await updateOrderStatus(orderId, newStatus);

        if (!result.success) {
            setError(result.error || 'Failed to update status');
        }

        setLoading(false);
    }

    if (!nextStatus && !canCancel) {
        return null;
    }

    if (['delivered', 'cancelled'].includes(currentStatus)) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('orders.updateStatus')}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {nextStatus && (
                    <button
                        onClick={() => handleStatusUpdate(nextStatus)}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? t('common.loading') : t(`orders.action.${nextStatus}`)}
                    </button>
                )}

                {canCancel && (
                    <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        disabled={loading}
                        className="px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                        {t('orders.action.cancel')}
                    </button>
                )}
            </div>

            <p className="mt-4 text-sm text-gray-500">
                {t('orders.statusNote')}
            </p>
        </div>
    );
}
