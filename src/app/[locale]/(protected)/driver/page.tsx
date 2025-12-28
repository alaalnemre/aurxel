import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { PageHeader, StatCard, EmptyState } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

export const runtime = 'nodejs';

export default async function DriverDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.driver_verified) {
        redirect(`/${locale}/become-driver`);
    }

    const supabase = await createClient();
    const { data: driver } = await supabase.from('drivers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!driver) redirect(`/${locale}/become-driver`);

    const { data: deliveries } = await supabase.from('deliveries').select('id, status').eq('driver_id', driver.id);
    const { data: availableDeliveries } = await supabase.from('deliveries').select('id').eq('status', 'available');

    const totalDeliveries = deliveries?.filter(d => d.status === 'delivered').length || 0;
    const activeDeliveries = deliveries?.filter(d => ['assigned', 'picked_up'].includes(d.status)).length || 0;
    const available = availableDeliveries?.length || 0;

    return (
        <div>
            <PageHeader title={t('driver.welcome')} action={<Link href={`/${locale}/driver/deliveries`}><Button>{t('driver.availableDeliveries')}</Button></Link>} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('driver.totalDeliveries')} value={totalDeliveries} />
                <StatCard title={t('driver.availableDeliveries')} value={available} />
                <StatCard title="Active" value={activeDeliveries} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href={`/${locale}/driver/deliveries?tab=available`} className="bg-white rounded-xl p-6 border hover:border-primary-300">
                    <h3 className="font-semibold text-lg mb-2">{t('driver.availableDeliveries')}</h3>
                    <p className="text-gray-500">{available} available</p>
                </Link>
                <Link href={`/${locale}/driver/deliveries?tab=my`} className="bg-white rounded-xl p-6 border hover:border-primary-300">
                    <h3 className="font-semibold text-lg mb-2">{t('driver.myDeliveries')}</h3>
                    <p className="text-gray-500">{activeDeliveries} active</p>
                </Link>
            </div>
        </div>
    );
}
