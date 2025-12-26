'use client';

import { useState } from 'react';
import { toggleProductStatus } from '@/lib/actions/seller';

export function ProductStatusToggle({
    productId,
    isActive,
    locale,
}: {
    productId: string;
    isActive: boolean;
    locale: string;
}) {
    const [active, setActive] = useState(isActive);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = !active;
        const result = await toggleProductStatus(productId, newStatus);
        if (!result.error) {
            setActive(newStatus);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-success' : 'bg-muted'
                } ${loading ? 'opacity-50' : ''}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                    }`}
            />
            <span className="sr-only">
                {active
                    ? (locale === 'ar' ? 'نشط' : 'Active')
                    : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
            </span>
        </button>
    );
}
