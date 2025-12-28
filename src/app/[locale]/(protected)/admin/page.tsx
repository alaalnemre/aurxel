import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import Link from 'next/link';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';

export const runtime = 'nodejs';

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) {
        redirect(`/${locale}/store`);
    }

    const supabase = await createClient();

    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: sellerCount } = await supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: driverCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: pendingApprovals } = await supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingDrivers } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: openDisputes } = await supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'investigating']);
    const { data: orders } = await supabase.from('orders').select('total, status');

    const totalRevenue = orders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total), 0) || 0;

    return (
        <div>
            <PageHeader title={t('admin.welcome')} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title={t('admin.totalUsers')} value={userCount || 0} />
                <StatCard title={t('admin.totalSellers')} value={sellerCount || 0} />
                <StatCard title={t('admin.totalDrivers')} value={driverCount || 0} />
                <StatCard title={t('admin.revenue')} value={`${totalRevenue.toFixed(2)} ${t('common.currency')}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href={`/${locale}/admin/approvals`} className="bg-white rounded-xl p-6 border hover:border-primary-300">
                    <h3 className="font-semibold text-lg mb-2">{t('admin.approvals')}</h3>
                    <p className="text-gray-500">{(pendingApprovals || 0) + (pendingDrivers || 0)} pending</p>
                </Link>
                <Link href={`/${locale}/admin/users`} className="bg-white rounded-xl p-6 border hover:border-primary-300">
                    <h3 className="font-semibold text-lg mb-2">{t('admin.users')}</h3>
                    <p className="text-gray-500">{userCount || 0} users</p>
                </Link>
                <Link href={`/${locale}/admin/disputes`} className="bg-white rounded-xl p-6 border hover:border-primary-300">
                    <h3 className="font-semibold text-lg mb-2">{t('admin.disputes')}</h3>
                    <p className="text-gray-500">{openDisputes || 0} open</p>
                </Link>
            </div>
        </div>
    );
}
