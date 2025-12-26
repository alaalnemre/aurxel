import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminOrdersPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ status?: string }>;
}) {
    const { locale } = await params;
    const search = await searchParams;
    setRequestLocale(locale);
    const t = await getTranslations('admin');

    const supabase = await createClient();

    // Build query
    let query = supabase
        .from('orders')
        .select('id, status, total_amount, delivery_fee, created_at, buyer_id, seller_id')
        .order('created_at', { ascending: false });

    if (search.status && search.status !== 'all') {
        query = query.eq('status', search.status);
    }

    const { data: orders } = await query.limit(50);

    // Get counts
    const { count: totalCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: placedCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'placed');
    const { count: deliveredCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered');
    const { count: cancelledCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled');

    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl font-bold">{t('orders')}</h1>

            {/* Status Tabs */}
            <div className="flex gap-2 flex-wrap">
                <TabLink href={`/${locale}/admin/orders`} active={!search.status || search.status === 'all'} label={`${locale === 'ar' ? 'الكل' : 'All'} (${totalCount || 0})`} />
                <TabLink href={`/${locale}/admin/orders?status=placed`} active={search.status === 'placed'} label={`📝 ${locale === 'ar' ? 'جديد' : 'Placed'} (${placedCount || 0})`} />
                <TabLink href={`/${locale}/admin/orders?status=delivered`} active={search.status === 'delivered'} label={`✅ ${locale === 'ar' ? 'مكتمل' : 'Delivered'} (${deliveredCount || 0})`} />
                <TabLink href={`/${locale}/admin/orders?status=cancelled`} active={search.status === 'cancelled'} label={`❌ ${locale === 'ar' ? 'ملغي' : 'Cancelled'} (${cancelledCount || 0})`} />
            </div>

            {/* Orders Table */}
            {orders && orders.length > 0 ? (
                <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'المبلغ' : 'Amount'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {(Number(order.total_amount) + Number(order.delivery_fee)).toFixed(2)} JOD
                                        </td>
                                        <td className="px-4 py-3 text-secondary text-sm">
                                            {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-2xl">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-secondary">{locale === 'ar' ? 'لا يوجد طلبات' : 'No orders found'}</p>
                </div>
            )}
        </div>
    );
}

function TabLink({ href, active, label }: { href: string; active: boolean; label: string }) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-white' : 'bg-muted text-secondary hover:bg-muted/80'
                }`}
        >
            {label}
        </Link>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusColors: Record<string, string> = {
        placed: 'bg-blue-100 text-blue-700',
        accepted: 'bg-purple-100 text-purple-700',
        preparing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-orange-100 text-orange-700',
        picked_up: 'bg-cyan-100 text-cyan-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}
