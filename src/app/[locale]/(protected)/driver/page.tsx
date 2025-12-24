import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, DollarSign, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface DriverDashboardProps {
    params: Promise<{ locale: string }>;
}

export default async function DriverDashboard({ params }: DriverDashboardProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user!.id)
        .single();

    // Get driver info
    const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user!.id)
        .single();

    // Get available deliveries count
    const { count: availableCount } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

    // Get assigned deliveries count
    const { count: assignedCount } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driver?.id)
        .in('status', ['assigned', 'picked_up']);

    // Get completed deliveries count
    const { count: completedCount } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driver?.id)
        .eq('status', 'delivered');

    // Get wallet balance
    const { data: wallet } = await supabase
        .from('wallet_accounts')
        .select('balance')
        .eq('owner_id', user!.id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">
                    {locale === 'ar'
                        ? `مرحباً، ${profile?.full_name || 'سائق'}!`
                        : `Welcome, ${profile?.full_name || 'Driver'}!`}
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
                        <div className="text-2xl font-bold">{wallet?.balance?.toFixed(2) || '0.00'} JOD</div>
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
