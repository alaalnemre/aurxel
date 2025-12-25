'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { acceptDelivery, updateDeliveryStatus } from '@/lib/deliveries/actions';
import type { DeliveryStatus } from '@/lib/types/database';

interface DeliveryStatusActionsProps {
    deliveryId: string;
    currentStatus: DeliveryStatus;
}

export function DeliveryStatusActions({
    deliveryId,
    currentStatus,
}: DeliveryStatusActionsProps) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleAccept() {
        setError(null);
        setLoading(true);

        const result = await acceptDelivery(deliveryId);

        if (!result.success) {
            setError(result.error || 'Failed to accept delivery');
        }

        setLoading(false);
    }

    async function handleStatusUpdate(newStatus: DeliveryStatus) {
        setError(null);
        setLoading(true);

        const result = await updateDeliveryStatus(deliveryId, newStatus);

        if (!result.success) {
            setError(result.error || 'Failed to update status');
        }

        setLoading(false);
    }

    // No actions for delivered
    if (currentStatus === 'delivered') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                    {t('delivery.deliveryComplete')}
                </h3>
                <p className="text-green-600 mt-1">{t('delivery.thankYou')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {currentStatus === 'available'
                    ? t('delivery.acceptThisDelivery')
                    : t('delivery.updateStatus')}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {currentStatus === 'available' && (
                    <button
                        onClick={handleAccept}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? t('common.loading') : t('delivery.action.accept')}
                    </button>
                )}

                {currentStatus === 'assigned' && (
                    <button
                        onClick={() => handleStatusUpdate('picked_up')}
                        disabled={loading}
                        className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                        {loading ? t('common.loading') : t('delivery.action.pickup')}
                    </button>
                )}

                {currentStatus === 'picked_up' && (
                    <button
                        onClick={() => handleStatusUpdate('delivered')}
                        disabled={loading}
                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? t('common.loading') : t('delivery.action.deliver')}
                    </button>
                )}
            </div>

            <p className="mt-4 text-sm text-gray-500">
                {currentStatus === 'available'
                    ? t('delivery.acceptNote')
                    : currentStatus === 'assigned'
                        ? t('delivery.pickupNote')
                        : t('delivery.deliverNote')}
            </p>
        </div>
    );
}
