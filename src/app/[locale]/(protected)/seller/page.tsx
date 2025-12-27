// src/app/[locale]/(protected)/seller/page.tsx
// Seller status page - shows seller profile status

import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function SellerPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Auth guard
    const user = await getUser();
    if (!user) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Fetch seller profile
    const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('store_name, store_description, status, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!sellerProfile) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                <p className="mt-4 text-gray-600">
                    You have not applied to become a seller yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>

            <div className="rounded-lg border p-4">
                <h2 className="mb-2 font-semibold">Seller Profile</h2>
                <p><strong>Store Name:</strong> {sellerProfile.store_name}</p>
                {sellerProfile.store_description && (
                    <p><strong>Description:</strong> {sellerProfile.store_description}</p>
                )}
                <p>
                    <strong>Status:</strong>{' '}
                    <StatusBadge status={sellerProfile.status} />
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    Applied: {new Date(sellerProfile.created_at).toLocaleDateString()}
                </p>
            </div>

            {sellerProfile.status === 'pending' && (
                <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
                    Your seller application is pending review. We will notify you once approved.
                </div>
            )}

            {sellerProfile.status === 'rejected' && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                    Your seller application was rejected. Please contact support for more information.
                </div>
            )}

            {sellerProfile.status === 'approved' && (
                <div className="rounded-lg bg-green-50 p-4 text-green-800">
                    Your seller account is active! You can start adding products.
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
