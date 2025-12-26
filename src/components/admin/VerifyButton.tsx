'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifySeller, verifyDriver } from '@/lib/actions/admin';

export function VerifyButton({
    type,
    id,
    locale,
}: {
    type: 'seller' | 'driver';
    id: string;
    locale: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);

        const result = type === 'seller'
            ? await verifySeller(id)
            : await verifyDriver(id);

        if (!result.error) {
            router.refresh();
        }

        setLoading(false);
    };

    return (
        <button
            onClick={handleVerify}
            disabled={loading}
            className="px-3 py-1.5 bg-success hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
            {loading
                ? (locale === 'ar' ? 'جاري...' : 'Loading...')
                : (locale === 'ar' ? 'توثيق' : 'Verify')}
        </button>
    );
}
