import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, StatCard } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const runtime = 'nodejs';

export default async function SellerFinancePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.seller_verified) {
        redirect(`/${locale}/become-seller`);
    }

    const supabase = await createClient();

    const { data: seller } = await supabase
        .from('sellers')
        .select('id, store_name, commission_rate')
        .eq('profile_id', profile.id)
        .maybeSingle();

    if (!seller) redirect(`/${locale}/become-seller`);

    // Get commission data
    const { data: commissions } = await supabase
        .from('order_commissions')
        .select(`
            id,
            order_id,
            order_total,
            commission_rate_snapshot,
            commission_amount,
            seller_earnings,
            is_settled,
            created_at,
            orders!inner(id, status, created_at)
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

    // Get payouts
    const { data: payouts } = await supabase
        .from('payouts')
        .select('id, amount, status, payment_method, created_at, processed_at')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

    // Calculate financials
    const totalGrossRevenue = commissions?.reduce((sum, c) => sum + Number(c.order_total), 0) || 0;
    const totalCommission = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
    const totalEarnings = commissions?.reduce((sum, c) => sum + Number(c.seller_earnings), 0) || 0;
    const unsettledEarnings = commissions?.filter(c => !c.is_settled).reduce((sum, c) => sum + Number(c.seller_earnings), 0) || 0;
    const settledEarnings = commissions?.filter(c => c.is_settled).reduce((sum, c) => sum + Number(c.seller_earnings), 0) || 0;

    const pendingPayouts = payouts?.filter(p => ['pending', 'processing'].includes(p.status)).reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const completedPayouts = payouts?.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const navItems = [
        { href: `/${locale}/seller`, label: t('seller.overview') },
        { href: `/${locale}/seller/orders`, label: t('seller.orders') },
        { href: `/${locale}/seller/products`, label: t('seller.products') },
        { href: `/${locale}/seller/analytics`, label: t('seller.analyticsTab') },
        { href: `/${locale}/seller/finance`, label: t('seller.financeTab'), active: true },
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
                    title={t('seller.financeTitle')}
                    description={t('seller.financeSubtitle')}
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title={t('seller.grossRevenue')}
                        value={`${totalGrossRevenue.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('seller.platformFees')}
                        value={`-${totalCommission.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('seller.netEarnings')}
                        value={`${totalEarnings.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title={t('seller.availableForPayout')}
                        value={`${unsettledEarnings.toFixed(2)} ${t('common.currency')}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        }
                    />
                </div>

                {/* Commission Info Box */}
                <div className="bg-info-soft rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-info flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-dark mb-1">{t('seller.commissionInfo')}</h4>
                            <p className="text-sm text-gray-600">
                                {t('seller.commissionInfoDesc', { rate: (seller.commission_rate * 100).toFixed(0) })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Commissions */}
                    <div className="bg-white rounded-xl border border-border shadow-card">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold text-dark">{t('seller.recentCommissions')}</h3>
                        </div>
                        <div className="divide-y divide-border max-h-96 overflow-y-auto">
                            {commissions && commissions.length > 0 ? (
                                commissions.slice(0, 10).map(c => (
                                    <div key={c.id} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-500">#{c.order_id.slice(0, 8)}</span>
                                            <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">{t('seller.orderTotal')}: {Number(c.order_total).toFixed(2)}</p>
                                                <p className="text-sm text-error">-{Number(c.commission_amount).toFixed(2)} ({(c.commission_rate_snapshot * 100).toFixed(0)}%)</p>
                                            </div>
                                            <span className="font-bold text-success">{Number(c.seller_earnings).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-400">{t('seller.noCommissions')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payout History */}
                    <div className="bg-white rounded-xl border border-border shadow-card">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-dark">{t('seller.payoutHistory')}</h3>
                            {unsettledEarnings > 0 && (
                                <Button size="sm" disabled>
                                    {t('seller.requestPayout')}
                                </Button>
                            )}
                        </div>
                        <div className="divide-y divide-border max-h-96 overflow-y-auto">
                            {payouts && payouts.length > 0 ? (
                                payouts.map(p => (
                                    <div key={p.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-dark">{Number(p.amount).toFixed(2)} {t('common.currency')}</p>
                                            <p className="text-sm text-gray-500">{p.payment_method}</p>
                                            <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'completed' ? 'bg-success-soft text-success' :
                                                p.status === 'failed' ? 'bg-error-soft text-error' :
                                                    'bg-warning-soft text-warning'
                                            }`}>
                                            {t(`seller.payoutStatuses.${p.status}`)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-400">{t('seller.noPayouts')}</p>
                                    <p className="text-sm text-gray-500 mt-2">{t('seller.noPayoutsDesc')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl border border-border shadow-card p-6">
                    <h3 className="text-lg font-semibold text-dark mb-4">{t('seller.financeSummary')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('seller.totalPaidOut')}</p>
                            <p className="text-xl font-bold text-dark">{completedPayouts.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('seller.pendingPayouts')}</p>
                            <p className="text-xl font-bold text-warning">{pendingPayouts.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('seller.settledEarnings')}</p>
                            <p className="text-xl font-bold text-success">{settledEarnings.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">{t('seller.unsettledEarnings')}</p>
                            <p className="text-xl font-bold text-primary">{unsettledEarnings.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
