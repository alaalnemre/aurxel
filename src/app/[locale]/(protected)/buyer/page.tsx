// src/app/[locale]/(protected)/buyer/page.tsx
// Buyer dashboard page with capability actions

import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { BecomeSellerCard, BecomeDriverCard } from '@/components/capabilities';
import type { SellerProfile, DriverProfile } from '@/lib/types/database';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function BuyerDashboard({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Get current user
    const user = await getUser();
    const supabase = await createClient();

    // Fetch profile and capability profiles
    let userName = 'User';
    let sellerProfile: SellerProfile | null = null;
    let driverProfile: DriverProfile | null = null;

    if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .maybeSingle();

        if (profile) {
            userName = profile.full_name || profile.email?.split('@')[0] || 'User';
        }

        // Fetch seller profile
        const { data: seller } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (seller) {
            sellerProfile = seller as SellerProfile;
        }

        // Fetch driver profile
        const { data: driver } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (driver) {
            driverProfile = driver as DriverProfile;
        }
    }

    return (
        <BuyerContent
            userName={userName}
            sellerProfile={sellerProfile}
            driverProfile={driverProfile}
        />
    );
}

function BuyerContent({
    userName,
    sellerProfile,
    driverProfile,
}: {
    userName: string;
    sellerProfile: SellerProfile | null;
    driverProfile: DriverProfile | null;
}) {
    const t = useTranslations('dashboard.buyer');
    const tHealth = useTranslations('healthCheck');

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="mt-2 text-blue-100">
                    {t('welcome', { name: userName })}
                </p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <DashboardCard
                    title="Orders"
                    value="0"
                    subtitle="No orders yet"
                    icon="📦"
                />
                <DashboardCard
                    title="Wishlist"
                    value="0"
                    subtitle="Items saved"
                    icon="❤️"
                />
                <DashboardCard
                    title="Wallet"
                    value="0 JOD"
                    subtitle="Balance"
                    icon="💰"
                />
            </div>

            {/* Become a Seller / Driver Section */}
            <div>
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Expand Your Opportunities
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <BecomeSellerCard existingProfile={sellerProfile} />
                    <BecomeDriverCard existingProfile={driverProfile} />
                </div>
            </div>

            {/* Health Check Badge */}
            <div className="rounded-lg bg-green-100 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <p>✅ {tHealth('serverRendering')}</p>
                <p>✅ {tHealth('sessionStatus', { status: 'Authenticated' })}</p>
            </div>
        </div>
    );
}

function DashboardCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );
}
