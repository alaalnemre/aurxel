'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { redeemCode } from '@/lib/qanz/actions';

export function RedeemCodeForm() {
    const t = useTranslations();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ balance: number } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!code.trim()) {
            setError(t('wallet.errors.codeRequired'));
            return;
        }

        setLoading(true);

        const result = await redeemCode(code.trim());

        if (!result.success) {
            setError(result.error || t('wallet.errors.redeemFailed'));
        } else {
            setSuccess({ balance: result.balance || 0 });
            setCode('');
        }

        setLoading(false);
    }

    // Format code as user types (XXXX-XXXX-XXXX)
    function handleCodeChange(value: string) {
        const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        const parts = cleaned.match(/.{1,4}/g) || [];
        setCode(parts.slice(0, 3).join('-'));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {t('wallet.enterCode')}
                </label>
                <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-mono tracking-wider uppercase"
                    maxLength={14}
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                    {t('wallet.redeemSuccess')}
                    <span className="font-bold ml-1">
                        {t('wallet.newBalance')}: {success.balance.toFixed(2)} QANZ
                    </span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? t('common.loading') : t('wallet.redeem')}
            </button>
        </form>
    );
}
