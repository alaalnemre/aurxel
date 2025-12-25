'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { voidCode } from '@/lib/qanz/actions';

interface VoidCodeButtonProps {
    codeId: string;
}

export function VoidCodeButton({ codeId }: VoidCodeButtonProps) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleVoid() {
        if (!confirm(t('qanz.confirmVoid'))) {
            return;
        }

        setError(null);
        setLoading(true);

        const result = await voidCode(codeId);

        if (!result.success) {
            setError(result.error || 'Failed to void');
        }

        setLoading(false);
    }

    return (
        <>
            <button
                onClick={handleVoid}
                disabled={loading}
                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
                {loading ? t('common.loading') : t('qanz.void')}
            </button>
            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </>
    );
}
