// src/components/capabilities/BecomeSellerCard.tsx
// Card for applying to become a seller

'use client';

import { useState, useTransition } from 'react';
import { becomeSeller } from '@/actions';
import type { SellerProfile } from '@/lib/types/database';

type Props = {
    existingProfile?: SellerProfile | null;
};

export function BecomeSellerCard({ existingProfile }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // If already applied, show status
    if (existingProfile) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            🏪 Seller Application
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Store: {existingProfile.store_name}
                        </p>
                    </div>
                    <StatusBadge status={existingProfile.status} />
                </div>
            </div>
        );
    }

    // If successfully submitted
    if (success) {
        return (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">
                            Application Submitted!
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                            We'll review your seller application soon.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    async function handleSubmit(formData: FormData) {
        setError(null);
        const storeName = formData.get('storeName') as string;
        const storeDescription = formData.get('storeDescription') as string;

        startTransition(async () => {
            const result = await becomeSeller(storeName);

            if (!result.success) {
                setError(result.error || 'Failed to submit application');
                return;
            }

            setSuccess(true);
        });
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        🏪 Become a Seller
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Start selling your products on JordanMarket
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                    >
                        Apply Now
                    </button>
                )}
            </div>

            {showForm && (
                <form action={handleSubmit} className="mt-4 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="storeName"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Store Name *
                        </label>
                        <input
                            type="text"
                            id="storeName"
                            name="storeName"
                            required
                            minLength={3}
                            maxLength={100}
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="My Store Name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="storeDescription"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Description (optional)
                        </label>
                        <textarea
                            id="storeDescription"
                            name="storeDescription"
                            maxLength={500}
                            rows={2}
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="What do you sell?"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            {isPending ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            disabled={isPending}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
