// src/app/[locale]/(protected)/driver/page.tsx
// Driver status page - shows driver profile status

import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function DriverPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Auth guard
    const user = await getUser();
    if (!user) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Fetch driver profile
    const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('vehicle_type, license_number, status, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!driverProfile) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Driver Dashboard</h1>
                <p className="mt-4 text-gray-600">
                    You have not applied to become a driver yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold">Driver Dashboard</h1>

            <div className="rounded-lg border p-4">
                <h2 className="mb-2 font-semibold">Driver Profile</h2>
                {driverProfile.vehicle_type && (
                    <p><strong>Vehicle Type:</strong> {driverProfile.vehicle_type}</p>
                )}
                {driverProfile.license_number && (
                    <p><strong>License:</strong> {driverProfile.license_number}</p>
                )}
                <p>
                    <strong>Status:</strong>{' '}
                    <StatusBadge status={driverProfile.status} />
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    Applied: {new Date(driverProfile.created_at).toLocaleDateString()}
                </p>
            </div>

            {driverProfile.status === 'pending' && (
                <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                    Your driver application is pending review. We will notify you once approved.
                </div>
            )}

            {driverProfile.status === 'rejected' && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                    Your driver application was rejected. Please contact support for more information.
                </div>
            )}

            {driverProfile.status === 'approved' && (
                <div className="rounded-lg bg-green-50 p-4 text-green-800">
                    Your driver account is active! You can start accepting deliveries.
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`inline-block rounded px-2 py-1 text-sm ${colors[status] || colors.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
