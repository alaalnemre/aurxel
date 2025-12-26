'use client';

import { useState } from 'react';
import { redeemTopupCode } from '@/lib/actions/wallet';

export function RedeemCodeForm({ locale, walletId }: { locale: string; walletId?: string }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!code.trim() || !walletId) return;

        setLoading(true);
        setMessage(null);

        const result = await redeemTopupCode(walletId, code.trim().toUpperCase());

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({
                type: 'success',
                text: locale === 'ar'
                    ? `تم شحن ${result.amount} QANZ بنجاح!`
                    : `Successfully added ${result.amount} QANZ!`,
            });
            setCode('');
        }

        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
                <div className={`px-4 py-3 rounded-lg ${message.type === 'success'
                        ? 'bg-success/10 border border-success/20 text-success'
                        : 'bg-error/10 border border-error/20 text-error'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-3">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={locale === 'ar' ? 'QANZ-XXXX-XXXX' : 'QANZ-XXXX-XXXX'}
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-mono uppercase tracking-wider"
                    maxLength={14}
                />
                <button
                    type="submit"
                    disabled={loading || !code.trim()}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading
                        ? (locale === 'ar' ? 'جاري...' : 'Loading...')
                        : (locale === 'ar' ? 'شحن' : 'Redeem')}
                </button>
            </div>
        </form>
    );
}
