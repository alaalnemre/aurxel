import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState, StatCard } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { getAdminDiscounts, createDiscountCode, disableDiscountCode, enableDiscountCode } from '@/actions/discounts';
import Link from 'next/link';

export const runtime = 'nodejs';

export default async function AdminDiscountsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) {
        redirect(`/${locale}/login`);
    }

    const result = await getAdminDiscounts();
    const discounts = result.data || [];

    // Stats
    const activeCount = discounts.filter(d => d.is_active).length;
    const totalUses = discounts.reduce((sum, d) => sum + d.current_uses, 0);

    return (
        <div>
            <PageHeader
                title={t('discounts.title')}
                description={t('discounts.subtitle')}
                action={
                    <Link href={`/${locale}/admin/discounts/new`}>
                        <Button>{t('discounts.createNew')}</Button>
                    </Link>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title={t('discounts.active')}
                    value={activeCount}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title={t('common.all')}
                    value={discounts.length}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    }
                />
                <StatCard
                    title={t('discounts.uses')}
                    value={totalUses}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Discounts Table */}
            {discounts.length > 0 ? (
                <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('discounts.code')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('discounts.type')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('discounts.value')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('discounts.uses')}</th>
                                    <th className="text-start px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('discounts.status')}</th>
                                    <th className="text-end px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.edit')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {discounts.map(discount => (
                                    <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-primary">{discount.code}</div>
                                            {discount.description && (
                                                <div className="text-sm text-gray-500">{discount.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {discount.discount_type === 'percentage' ? t('discounts.percentage') : t('discounts.fixed')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {discount.discount_type === 'percentage'
                                                ? `${discount.discount_value}%`
                                                : `${discount.discount_value} ${t('common.currency')}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {discount.current_uses} / {discount.max_uses || t('discounts.unlimited')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${discount.is_active ? 'bg-success-soft text-success' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {discount.is_active ? t('discounts.active') : t('discounts.inactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <form action={async () => {
                                                'use server';
                                                if (discount.is_active) {
                                                    await disableDiscountCode(discount.id);
                                                } else {
                                                    await enableDiscountCode(discount.id);
                                                }
                                            }}>
                                                <Button type="submit" variant="ghost" size="sm">
                                                    {discount.is_active ? t('discounts.disable') : t('discounts.enable')}
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <EmptyState
                    iconType="earnings"
                    title={t('discounts.noDiscounts')}
                    description={t('discounts.noDiscountsDesc')}
                    action={
                        <Link href={`/${locale}/admin/discounts/new`}>
                            <Button>{t('discounts.createNew')}</Button>
                        </Link>
                    }
                />
            )}
        </div>
    );
}
