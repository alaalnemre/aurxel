// src/app/[locale]/(protected)/buyer/CapabilityButtons.tsx
// Client components for capability action buttons

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { becomeSeller, becomeDriver } from '@/actions';

type Props = {
    hasApplied: boolean;
    status: string | null;
};

export function BecomeSellerButton({ hasApplied, status }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    if (hasApplied) {
        return (
            <div className="rounded border p-3">
                <p className="font-medium">Seller Application</p>
                <p className="text-sm">Status: {status}</p>
            </div>
        );
    }

    async function handleSubmit(formData: FormData) {
        setError(null);
        const storeName = formData.get('storeName') as string;

        startTransition(async () => {
            const result = await becomeSeller(storeName);
            if (!result.success) {
                setError(result.error || 'Failed');
                return;
            }
            router.refresh();
        });
    }

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
                Become a Seller
            </button>
        );
    }

    return (
        <form action={handleSubmit} className="rounded border p-3 space-y-2">
            <input
                type="text"
                name="storeName"
                required
                placeholder="Store Name"
                disabled={isPending}
                className="w-full rounded border p-2"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
                >
                    {isPending ? '...' : 'Submit'}
                </button>
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded border px-3 py-1"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export function BecomeDriverButton({ hasApplied, status }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    if (hasApplied) {
        return (
            <div className="rounded border p-3">
                <p className="font-medium">Driver Application</p>
                <p className="text-sm">Status: {status}</p>
            </div>
        );
    }

    async function handleClick() {
        setError(null);
        startTransition(async () => {
            const result = await becomeDriver();
            if (!result.success) {
                setError(result.error || 'Failed');
                return;
            }
            router.refresh();
        });
    }

    return (
        <div>
            <button
                onClick={handleClick}
                disabled={isPending}
                className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
            >
                {isPending ? '...' : 'Become a Driver'}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
