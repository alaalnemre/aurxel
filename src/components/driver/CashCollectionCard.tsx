'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { markCashCollected } from '@/lib/cash/actions';
import type { CashCollectionWithDetails } from '@/lib/types/database';

interface CashCollectionCardProps {
    collection: CashCollectionWithDetails;
    locale: string;
}

export function CashCollectionCard({ collection, locale }: CashCollectionCardProps) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [amount, setAmount] = useState(collection.amount_expected.toString());
    const [error, setError] = useState<string | null>(null);

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        collected: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-green-100 text-green-700',
    };

    async function handleMarkCollected() {
        setError(null);
        setLoading(true);

        const result = await markCashCollected(collection.id, parseFloat(amount));

        if (!result.success) {
            setError(result.error || 'Failed to update');
        }

        setLoading(false);
        setShowInput(false);
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

            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">
                    {t('cash.expectedAmount')}
                </div>
                <div className="text-lg font-bold text-gray-900">
                    {collection.amount_expected.toFixed(2)} JOD
                </div>
            </div>

            {collection.amount_collected !== null && (
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">{t('cash.collectedAmount')}</div>
                    <div className="text-lg font-bold text-green-600">
                        {collection.amount_collected.toFixed(2)} JOD
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {collection.status === 'pending' && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                    {showInput ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('cash.amountCollected')}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleMarkCollected}
                                    disabled={loading}
                                    className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? t('common.loading') : t('cash.confirm')}
                                </button>
                                <button
                                    onClick={() => setShowInput(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowInput(true)}
                            className="w-full py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700"
                        >
                            {t('cash.markCollected')}
                        </button>
                    )}
                </div>
            )}

            {collection.status === 'collected' && (
                <div className="border-t border-gray-200 pt-3 mt-3 text-center text-sm text-blue-600">
                    {t('cash.waitingAdminConfirmation')}
                </div>
            )}

            {collection.status === 'confirmed' && collection.confirmed_at && (
                <div className="border-t border-gray-200 pt-3 mt-3 text-center text-sm text-green-600">
                    {t('cash.confirmedAt')}: {new Date(collection.confirmed_at).toLocaleDateString(locale)}
                </div>
            )}
        </div>
    );
}
