import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminUsersPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ role?: string; q?: string }>;
}) {
    const { locale } = await params;
    const search = await searchParams;
    setRequestLocale(locale);
    const t = await getTranslations('admin');

    const supabase = await createClient();

    // Build users query
    let query = supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .order('created_at', { ascending: false });

    // Role filter
    if (search.role && search.role !== 'all') {
        query = query.eq('role', search.role);
    }

    // Search filter
    if (search.q) {
        query = query.or(`full_name.ilike.%${search.q}%,phone.ilike.%${search.q}%`);
    }

    const { data: users } = await query.limit(50);

    // Get counts by role
    const { count: buyerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer');
    const { count: sellerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller');
    const { count: driverCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver');
    const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('users')}</h1>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-2 flex-wrap">
                <TabLink href={`/${locale}/admin/users`} active={!search.role || search.role === 'all'} label={locale === 'ar' ? 'الكل' : 'All'} />
                <TabLink href={`/${locale}/admin/users?role=buyer`} active={search.role === 'buyer'} label={`🛒 ${locale === 'ar' ? 'مشتري' : 'Buyers'} (${buyerCount || 0})`} />
                <TabLink href={`/${locale}/admin/users?role=seller`} active={search.role === 'seller'} label={`🏪 ${locale === 'ar' ? 'بائع' : 'Sellers'} (${sellerCount || 0})`} />
                <TabLink href={`/${locale}/admin/users?role=driver`} active={search.role === 'driver'} label={`🛵 ${locale === 'ar' ? 'سائق' : 'Drivers'} (${driverCount || 0})`} />
                <TabLink href={`/${locale}/admin/users?role=admin`} active={search.role === 'admin'} label={`👑 ${locale === 'ar' ? 'أدمن' : 'Admins'} (${adminCount || 0})`} />
            </div>

            {/* Search */}
            <form className="max-w-md">
                <input
                    type="search"
                    name="q"
                    defaultValue={search.q || ''}
                    placeholder={locale === 'ar' ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card focus:border-primary outline-none"
                />
            </form>

            {/* Users Table */}
            {users && users.length > 0 ? (
                <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'المستخدم' : 'User'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الهاتف' : 'Phone'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الدور' : 'Role'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'تاريخ التسجيل' : 'Joined'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{user.full_name || 'N/A'}</p>
                                            <p className="text-xs text-secondary font-mono">{user.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-4 py-3 text-secondary">{user.phone || '-'}</td>
                                        <td className="px-4 py-3">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-4 py-3 text-secondary text-sm">
                                            {new Date(user.created_at).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/${locale}/admin/users/${user.id}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {locale === 'ar' ? 'عرض' : 'View'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-2xl">
                    <div className="text-5xl mb-4">👥</div>
                    <p className="text-secondary">{locale === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}</p>
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

function RoleBadge({ role }: { role: string }) {
    const roleConfig: Record<string, { bg: string; icon: string }> = {
        buyer: { bg: 'bg-blue-100 text-blue-700', icon: '🛒' },
        seller: { bg: 'bg-green-100 text-green-700', icon: '🏪' },
        driver: { bg: 'bg-orange-100 text-orange-700', icon: '🛵' },
        admin: { bg: 'bg-purple-100 text-purple-700', icon: '👑' },
    };
    const config = roleConfig[role] || { bg: 'bg-gray-100', icon: '👤' };

    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.bg}`}>
            {config.icon} {role}
        </span>
    );
}
