import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, MapPin, DollarSign } from 'lucide-react';
import { DeliveryActions } from '@/components/driver/delivery-actions';

interface DriverDeliveriesPageProps {
    params: Promise<{ locale: string }>;
}

// Force dynamic rendering - required for auth cookies
export const dynamic = 'force-dynamic';

export default async function DriverDeliveriesPage({ params }: DriverDeliveriesPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    type DeliveryItem = {
        id: string;
        status: string;
        pickup_address: string;
        dropoff_address: string;
        cod_amount: number;
    };

    let availableDeliveries: DeliveryItem[] | null = null;
    let myDeliveries: DeliveryItem[] | null = null;

    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[DriverDeliveries] Auth error:', authError.message);
        }

        if (!user) {
            console.error('[DriverDeliveries] No user found');
            return <div className="p-6">Loading...</div>;
        }

        // Get driver
        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (driverError) {
            console.error('[DriverDeliveries] Driver fetch error:', driverError.message);
        }

        // Get available deliveries
        const { data: availData, error: availError } = await supabase
            .from('deliveries')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (availError) {
            console.error('[DriverDeliveries] Available deliveries error:', availError.message);
        }
        availableDeliveries = availData;

        // Get my deliveries
        const { data: myData, error: myError } = await supabase
            .from('deliveries')
            .select('*')
            .eq('driver_id', driver?.id || '')
            .order('created_at', { ascending: false });

        if (myError) {
            console.error('[DriverDeliveries] My deliveries error:', myError.message);
        }
        myDeliveries = myData;

    } catch (error) {
        console.error('[DriverDeliveries] Unhandled error:', error);
        return <div className="p-6">Loading deliveries...</div>;
    }

    const activeDeliveries = myDeliveries?.filter(d => ['assigned', 'picked_up'].includes(d.status)) || [];
    const completedDeliveries = myDeliveries?.filter(d => d.status === 'delivered') || [];


    const t = {
        title: locale === 'ar' ? 'التوصيلات' : 'Deliveries',
        available: locale === 'ar' ? 'متاحة' : 'Available',
        active: locale === 'ar' ? 'نشطة' : 'Active',
        completed: locale === 'ar' ? 'مكتملة' : 'Completed',
        noDeliveries: locale === 'ar' ? 'لا توجد توصيلات' : 'No deliveries',
        pickup: locale === 'ar' ? 'الاستلام' : 'Pickup',
        dropoff: locale === 'ar' ? 'التوصيل' : 'Dropoff',
        cod: locale === 'ar' ? 'الدفع عند الاستلام' : 'COD Amount',
    };

    const renderDelivery = (delivery: NonNullable<typeof availableDeliveries>[0]) => (
        <Card key={delivery.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">
                            {locale === 'ar' ? 'توصيل' : 'Delivery'} #{delivery.id.slice(0, 8)}
                        </span>
                    </div>
                    <Badge>{delivery.status.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="grid gap-2 text-sm">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                            <p className="text-muted-foreground text-xs">{t.pickup}</p>
                            <p>{delivery.pickup_address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                            <p className="text-muted-foreground text-xs">{t.dropoff}</p>
                            <p>{delivery.dropoff_address}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span>{t.cod}: <strong>{Number(delivery.cod_amount).toFixed(2)} JOD</strong></span>
                    </div>
                    <DeliveryActions deliveryId={delivery.id} status={delivery.status} locale={locale} />
                </div>
            </CardContent>
        </Card>
    );

    const renderEmpty = () => (
        <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t.noDeliveries}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            <Tabs defaultValue="available" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="available" className="relative">
                        {t.available}
                        {(availableDeliveries?.length || 0) > 0 && (
                            <Badge variant="default" className="ml-2 h-5 w-5 p-0 justify-center">
                                {availableDeliveries?.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active">
                        {t.active}
                        {activeDeliveries.length > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center">
                                {activeDeliveries.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="completed">{t.completed}</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="mt-4 space-y-4">
                    {!availableDeliveries || availableDeliveries.length === 0
                        ? renderEmpty()
                        : availableDeliveries.map(renderDelivery)}
                </TabsContent>
                <TabsContent value="active" className="mt-4 space-y-4">
                    {activeDeliveries.length === 0
                        ? renderEmpty()
                        : activeDeliveries.map(renderDelivery)}
                </TabsContent>
                <TabsContent value="completed" className="mt-4 space-y-4">
                    {completedDeliveries.length === 0
                        ? renderEmpty()
                        : completedDeliveries.map(renderDelivery)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
