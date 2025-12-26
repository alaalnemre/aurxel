'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptDelivery, pickupDelivery, completeDelivery } from '@/lib/actions/driver';

export function DeliveryActions({
    deliveryId,
    currentStatus,
    totalAmount,
    locale,
}: {
    deliveryId: string;
    currentStatus: string;
    totalAmount: number;
    locale: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        setLoading(true);
        setError(null);
        const result = await acceptDelivery(deliveryId);
        if (result.error) {
            setError(result.error);
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    const handlePickup = async () => {
        setLoading(true);
        setError(null);
        const result = await pickupDelivery(deliveryId);
        if (result.error) {
            setError(result.error);
        } else {
            router.refresh();
        }
        setLoading(false);
    };

    const handleComplete = async () => {
        setLoading(true);
        setError(null);
        const result = await completeDelivery(deliveryId, totalAmount);
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

            {currentStatus === 'available' && (
                <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        locale === 'ar' ? 'جاري...' : 'Loading...'
                    ) : (
                        <>
                            <span>✓</span>
                            {locale === 'ar' ? 'قبول التوصيل' : 'Accept Delivery'}
                        </>
                    )}
                </button>
            )}

            {currentStatus === 'assigned' && (
                <button
                    onClick={handlePickup}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        locale === 'ar' ? 'جاري...' : 'Loading...'
                    ) : (
                        <>
                            <span>📦</span>
                            {locale === 'ar' ? 'تم استلام الطلب' : 'Picked Up'}
                        </>
                    )}
                </button>
            )}

            {currentStatus === 'picked_up' && (
                <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-success hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        locale === 'ar' ? 'جاري...' : 'Loading...'
                    ) : (
                        <>
                            <span>✅</span>
                            {locale === 'ar' ? 'تم التوصيل وتحصيل' : 'Delivered & Collected'}
                            <span className="font-bold">{totalAmount.toFixed(2)} JOD</span>
                        </>
                    )}
                </button>
            )}

            {currentStatus === 'delivered' && (
                <div className="text-center text-success font-medium">
                    ✅ {locale === 'ar' ? 'تم التوصيل' : 'Delivered'}
                </div>
            )}
        </div>
    );
}
