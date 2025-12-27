// src/app/[locale]/(protected)/buyer/page.tsx
// Buyer dashboard - shows email, capabilities, and action buttons

import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';
import { BecomeSellerButton, BecomeDriverButton } from './CapabilityButtons';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function BuyerDashboard({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Auth guard
    const user = await getUser();
    if (!user) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Fetch profile and capabilities
    const { data: profile } = await supabase
        .from('profiles')
        .select('email, is_buyer, is_seller, is_driver, is_admin')
        .eq('id', user.id)
        .maybeSingle();

    // Fetch seller profile to check if already applied
    const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();

    // Fetch driver profile to check if already applied
    const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold">Buyer Dashboard</h1>

            {/* User Info */}
            <div className="rounded-lg border p-4">
                <h2 className="mb-2 font-semibold">Profile</h2>
                <p><strong>Email:</strong> {profile?.email || user.email}</p>
            </div>

            {/* Capabilities */}
            <div className="rounded-lg border p-4">
                <h2 className="mb-2 font-semibold">Capabilities</h2>
                <ul className="list-disc pl-5">
                    {profile?.is_buyer && <li>Buyer: ✅ Active</li>}
                    {profile?.is_seller && <li>Seller: ✅ Active</li>}
                    {profile?.is_driver && <li>Driver: ✅ Active</li>}
                    {profile?.is_admin && <li>Admin: ✅ Active</li>}
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="rounded-lg border p-4">
                <h2 className="mb-4 font-semibold">Expand Capabilities</h2>
                <div className="flex gap-4">
                    <BecomeSellerButton
                        hasApplied={!!sellerProfile}
                        status={sellerProfile?.status || null}
                    />
                    <BecomeDriverButton
                        hasApplied={!!driverProfile}
                        status={driverProfile?.status || null}
                    />
                </div>
            </div>
        </div>
    );
}
