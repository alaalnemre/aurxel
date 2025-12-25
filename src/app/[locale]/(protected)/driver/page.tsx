import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, DollarSign, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface DriverDashboardProps {
    params: Promise<{ locale: string }>;
}

// Force dynamic rendering and Node.js runtime - required for auth cookies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function DriverDashboard({ params }: DriverDashboardProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    let profileName = '';
    let availableCount: number | null = 0;
    let assignedCount: number | null = 0;
    let completedCount: number | null = 0;
    let walletBalance = 0;

    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[DriverDashboard] Auth error:', authError.message);
        }

        if (!user) {
            console.error('[DriverDashboard] No user found');
            return <div className="p-6">Loading...</div>;
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('[DriverDashboard] Profile fetch error:', profileError.message);
        }
        profileName = profile?.full_name || '';

        // Get driver info
        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (driverError) {
            console.error('[DriverDashboard] Driver fetch error:', driverError.message);
        }

        // Get available deliveries count
        const { count: availCount, error: availError } = await supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available');

        if (availError) {
            console.error('[DriverDashboard] Available count error:', availError.message);
        }
        availableCount = availCount;

        // Get assigned deliveries count
        const { count: assignCount, error: assignError } = await supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', driver?.id)
            .in('status', ['assigned', 'picked_up']);

        if (assignError) {
            console.error('[DriverDashboard] Assigned count error:', assignError.message);
        }
        assignedCount = assignCount;

        // Get completed deliveries count
        const { count: compCount, error: compError } = await supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', driver?.id)
            .eq('status', 'delivered');

        if (compError) {
            console.error('[DriverDashboard] Completed count error:', compError.message);
        }
        completedCount = compCount;

        // Get wallet balance
        const { data: wallet, error: walletError } = await supabase
            .from('wallet_accounts')
            .select('balance')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (walletError) {
            console.error('[DriverDashboard] Wallet fetch error:', walletError.message);
        }
        walletBalance = wallet?.balance ? Number(wallet.balance) : 0;

    } catch (error) {
        console.error('[DriverDashboard] Unhandled error:', error);
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        {locale === 'ar' ? 'لوحة تحكم السائق' : 'Driver Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        {locale === 'ar' ? 'جاري تحميل البيانات...' : 'Loading your data...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">
                    {locale === 'ar'
                        ? `مرحباً، ${profileName || 'سائق'}!`
                        : `Welcome, ${profileName || 'Driver'}!`}
                </h1>
                <p className="text-muted-foreground">
                    {locale === 'ar' ? 'إليك نظرة عامة على نشاطك' : "Here's your activity overview"}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className={availableCount && availableCount > 0 ? 'border-green-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'توصيلات متاحة' : 'Available'}
                        </CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableCount || 0}</div>
                        <Link href={`/${locale}/driver/deliveries?tab=available`} className="text-xs text-primary hover:underline">
                            {locale === 'ar' ? 'عرض المتاح' : 'View available'}
                        </Link>
                    </CardContent>
                </Card>

                <Card className={assignedCount && assignedCount > 0 ? 'border-yellow-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'قيد التوصيل' : 'In Progress'}
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignedCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'توصيلات نشطة' : 'active deliveries'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'مكتملة' : 'Completed'}
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'إجمالي التوصيلات' : 'total deliveries'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance'}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{walletBalance.toFixed(2)} JOD</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'من التوصيلات' : 'from deliveries'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Action */}
            {(availableCount || 0) > 0 && (
                <Card className="bg-primary text-primary-foreground">
                    <CardContent className="flex items-center justify-between py-6">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {locale === 'ar' ? 'توصيلات جديدة متاحة!' : 'New deliveries available!'}
                            </h3>
                            <p className="text-sm opacity-90">
                                {locale === 'ar'
                                    ? `${availableCount} توصيلة في انتظارك`
                                    : `${availableCount} deliveries waiting for you`}
                            </p>
                        </div>
                        <Link href={`/${locale}/driver/deliveries?tab=available`}>
                            <Button variant="secondary">
                                {locale === 'ar' ? 'عرض التوصيلات' : 'View Deliveries'}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
