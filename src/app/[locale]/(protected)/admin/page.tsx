import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Store, Truck, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering and Node.js runtime - required for auth cookies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface AdminDashboardProps {
    params: Promise<{ locale: string }>;
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();

    // Get counts
    const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: sellersCount } = await supabase
        .from('sellers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    const { count: driversCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    const { count: pendingSellersCount } = await supabase
        .from('sellers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const { count: pendingDriversCount } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const pendingApprovals = (pendingSellersCount || 0) + (pendingDriversCount || 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">
                    {locale === 'ar' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                    {locale === 'ar' ? 'نظرة عامة على النظام' : 'System overview'}
                </p>
            </div>

            {/* Alert for pending approvals */}
            {pendingApprovals > 0 && (
                <Card className="border-yellow-500 bg-yellow-500/10">
                    <CardContent className="flex items-center gap-4 py-4">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        <div className="flex-1">
                            <h3 className="font-semibold">
                                {locale === 'ar'
                                    ? `${pendingApprovals} طلب بانتظار الموافقة`
                                    : `${pendingApprovals} pending approvals`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {locale === 'ar'
                                    ? `${pendingSellersCount || 0} بائع، ${pendingDriversCount || 0} سائق`
                                    : `${pendingSellersCount || 0} sellers, ${pendingDriversCount || 0} drivers`}
                            </p>
                        </div>
                        <Link href={`/${locale}/admin/approvals`} className="text-primary hover:underline text-sm">
                            {locale === 'ar' ? 'مراجعة' : 'Review'}
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'المستخدمين' : 'Users'}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usersCount || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'البائعين' : 'Sellers'}
                        </CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sellersCount || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'السائقين' : 'Drivers'}
                        </CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driversCount || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'الطلبات' : 'Orders'}
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ordersCount || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'بانتظار الموافقة' : 'Pending'}
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingApprovals}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'الإيرادات' : 'Revenue'}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0 JOD</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
