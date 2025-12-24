import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Truck, Clock, CheckCircle } from 'lucide-react';
import { ApprovalButtons } from '@/components/admin/approval-buttons';

interface AdminApprovalsPageProps {
    params: Promise<{ locale: string }>;
}

export default async function AdminApprovalsPage({ params }: AdminApprovalsPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();

    // Get pending sellers
    const { data: pendingSellers } = await supabase
        .from('sellers')
        .select('*, profiles(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    // Get pending drivers
    const { data: pendingDrivers } = await supabase
        .from('drivers')
        .select('*, profiles(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    const t = {
        title: locale === 'ar' ? 'الموافقات' : 'Approvals',
        sellers: locale === 'ar' ? 'البائعين' : 'Sellers',
        drivers: locale === 'ar' ? 'السائقين' : 'Drivers',
        noPending: locale === 'ar' ? 'لا توجد طلبات معلقة' : 'No pending requests',
        businessName: locale === 'ar' ? 'اسم النشاط' : 'Business Name',
        address: locale === 'ar' ? 'العنوان' : 'Address',
        appliedOn: locale === 'ar' ? 'تاريخ التقديم' : 'Applied on',
        pending: locale === 'ar' ? 'معلق' : 'Pending',
    };

    const renderSeller = (seller: NonNullable<typeof pendingSellers>[0]) => (
        <Card key={seller.id} className="border-yellow-500">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-yellow-100 p-2">
                            <Store className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-semibold">{seller.business_name}</p>
                            <p className="text-sm text-muted-foreground">{seller.address || 'No address'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t.appliedOn}: {new Date(seller.created_at).toLocaleDateString(locale)}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {t.pending}
                    </Badge>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <ApprovalButtons id={seller.id} type="seller" locale={locale} />
                </div>
            </CardContent>
        </Card>
    );

    const renderDriver = (driver: NonNullable<typeof pendingDrivers>[0]) => (
        <Card key={driver.id} className="border-yellow-500">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-yellow-100 p-2">
                            <Truck className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-semibold">
                                {(driver.profiles as { full_name?: string })?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t.appliedOn}: {new Date(driver.created_at).toLocaleDateString(locale)}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {t.pending}
                    </Badge>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <ApprovalButtons id={driver.id} type="driver" locale={locale} />
                </div>
            </CardContent>
        </Card>
    );

    const renderEmpty = () => (
        <Card>
            <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">{t.noPending}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            <Tabs defaultValue="sellers" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sellers" className="relative">
                        {t.sellers}
                        {(pendingSellers?.length || 0) > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                                {pendingSellers?.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="drivers" className="relative">
                        {t.drivers}
                        {(pendingDrivers?.length || 0) > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">
                                {pendingDrivers?.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sellers" className="mt-4 space-y-4">
                    {!pendingSellers || pendingSellers.length === 0
                        ? renderEmpty()
                        : pendingSellers.map(renderSeller)}
                </TabsContent>
                <TabsContent value="drivers" className="mt-4 space-y-4">
                    {!pendingDrivers || pendingDrivers.length === 0
                        ? renderEmpty()
                        : pendingDrivers.map(renderDriver)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
