// src/components/capabilities/BecomeDriverCard.tsx
// Card for applying to become a driver

'use client';

import { useState, useTransition } from 'react';
import { becomeDriver } from '@/actions';
import type { DriverProfile } from '@/lib/types/database';

type Props = {
    existingProfile?: DriverProfile | null;
};

export function BecomeDriverCard({ existingProfile }: Props) {
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
                            🚚 Driver Application
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {existingProfile.vehicle_type || 'Vehicle pending'}
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
                            We'll review your driver application soon.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    async function handleSubmit(formData: FormData) {
        setError(null);
        const vehicleType = formData.get('vehicleType') as string;
        const licenseNumber = formData.get('licenseNumber') as string;

        startTransition(async () => {
            const result = await becomeDriver();

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
                        🚚 Become a Driver
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Deliver orders and earn money
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
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
                            htmlFor="vehicleType"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Vehicle Type (optional)
                        </label>
                        <input
                            type="text"
                            id="vehicleType"
                            name="vehicleType"
                            maxLength={50}
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="e.g., Motorcycle, Car, Van"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="licenseNumber"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            License Number (optional)
                        </label>
                        <input
                            type="text"
                            id="licenseNumber"
                            name="licenseNumber"
                            maxLength={50}
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="Your driver's license number"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
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
