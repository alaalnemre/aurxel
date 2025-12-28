import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';
import Link from 'next/link';

export const runtime = 'nodejs';

export default async function DriverEarningsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.driver_verified) {
        redirect(`/${locale}/become-driver`);
    }

    const supabase = await createClient();
    const { data: driver } = await supabase.from('drivers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!driver) redirect(`/${locale}/become-driver`);

    // Get wallet
    const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance_jod, coins')
        .eq('profile_id', profile.id)
        .maybeSingle();

    // Get wallet transactions
    const { data: transactions } = wallet?.id ? await supabase
        .from('wallet_transactions')
        .select('id, type, amount, balance_after, description, created_at')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(20) : { data: [] };

    // Get completed deliveries for earnings breakdown
    const { data: deliveries } = await supabase
        .from('deliveries')
        .select(`
            id,
            delivered_at,
            orders!inner(id, delivery_fee)
        `)
        .eq('driver_id', driver.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

    // Calculate earnings by month
    const monthlyEarnings: Record<string, number> = {};
    deliveries?.forEach(d => {
        if (d.delivered_at) {
            const month = new Date(d.delivered_at).toISOString().slice(0, 7);
            const orderData = d.orders as unknown as { delivery_fee: number } | null;
            monthlyEarnings[month] = (monthlyEarnings[month] || 0) + (orderData?.delivery_fee || 0);
        }
    });

    const sortedMonths = Object.entries(monthlyEarnings)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 6);

    // Total earnings
    const totalEarnings = deliveries?.reduce((sum, d) => {
        const orderData = d.orders as unknown as { delivery_fee: number } | null;
        return sum + (orderData?.delivery_fee || 0);
    }, 0) || 0;

    const navItems = [
        { href: `/${locale}/driver`, label: t('driver.overview') },
        { href: `/${locale}/driver/deliveries`, label: t('driver.myDeliveries') },
        { href: `/${locale}/driver/earnings`, label: t('driver.earningsTab'), active: true },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <nav className="mb-8 border-b border-border">
                    <div className="flex flex-wrap gap-1 -mb-px">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${item.active
                                        ? 'text-primary border-primary'
                                        : 'text-gray-500 border-transparent hover:text-primary hover:border-primary'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <PageHeader
                    title={t('driver.earningsTitle')}
                    description={t('driver.earningsSubtitle')}
                />

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title={t('driver.walletBalance')}
                        value={`${(wallet?.balance_jod || 0).toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('driver.totalEarnings')}
                        value={`${totalEarnings.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('driver.totalDeliveries')}
                        value={deliveries?.length || 0}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Earnings */}
                    <div className="bg-white rounded-xl border border-border shadow-card">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-dark">{t('driver.monthlyBreakdown')}</h3>
                        </div>
                        <div className="p-6">
                            {sortedMonths.length > 0 ? (
                                <div className="space-y-4">
                                    {sortedMonths.map(([month, amount]) => (
                                        <div key={month} className="flex items-center justify-between">
                                            <span className="text-gray-600">
                                                {new Date(month + '-01').toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-US', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="font-bold text-success">{amount.toFixed(2)} {t('common.currency')}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">{t('driver.noEarningsYet')}</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-xl border border-border shadow-card">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-dark">{t('driver.recentTransactions')}</h3>
                        </div>
                        <div className="divide-y divide-border max-h-96 overflow-y-auto">
                            {transactions && transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <div key={tx.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-dark capitalize">{tx.type.replace('_', ' ')}</p>
                                            {tx.description && <p className="text-sm text-gray-500">{tx.description}</p>}
                                            <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`font-bold ${tx.amount >= 0 ? 'text-success' : 'text-error'}`}>
                                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-400">{t('driver.noTransactions')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
