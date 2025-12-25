'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { confirmCashReceipt } from '@/lib/cash/actions';
import type { CashCollectionWithDetails } from '@/lib/types/database';

interface AdminCashCardProps {
    collection: CashCollectionWithDetails;
    locale: string;
}

export function AdminCashCard({ collection, locale }: AdminCashCardProps) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        collected: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-green-100 text-green-700',
    };

    async function handleConfirm() {
        setError(null);
        setLoading(true);

        const result = await confirmCashReceipt(collection.id);

        if (!result.success) {
            setError(result.error || 'Failed to confirm');
        }

        setLoading(false);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm text-gray-500">
                        {t('orders.orderId')}: #
                        {collection.order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(collection.created_at).toLocaleDateString(locale)}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[collection.status]
                        }`}
                >
                    {t(`cash.status.${collection.status}`)}
                </span>
            </div>

            {/* Driver Info */}
            <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                        {(collection.driver?.full_name || 'D')[0].toUpperCase()}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-gray-900">
                        {collection.driver?.full_name || 'Driver'}
                    </p>
                    <p className="text-sm text-gray-500">
                        {collection.driver?.phone || 'No phone'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <div className="text-sm text-gray-500">{t('cash.expectedAmount')}</div>
                    <div className="font-bold text-gray-900">
                        {collection.amount_expected.toFixed(2)} JOD
                    </div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">{t('cash.collectedAmount')}</div>
                    <div className="font-bold text-green-600">
                        {collection.amount_collected?.toFixed(2) || '-'} JOD
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {collection.status === 'collected' && (
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? t('common.loading') : t('cash.confirmReceipt')}
                </button>
            )}

            {collection.status === 'pending' && (
                <div className="text-center text-sm text-yellow-600">
                    {t('cash.waitingDriverCollection')}
                </div>
            )}
        </div>
    );
}
