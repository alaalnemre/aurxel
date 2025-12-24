import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, MapPin, DollarSign } from 'lucide-react';

interface DriverDeliveriesPageProps {
    params: Promise<{ locale: string }>;
}

export default async function DriverDeliveriesPage({ params }: DriverDeliveriesPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get driver
    const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user!.id)
        .single();

    // Get available deliveries
    const { data: availableDeliveries } = await supabase
        .from('deliveries')
        .select('*, orders(*)')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

    // Get my deliveries
    const { data: myDeliveries } = await supabase
        .from('deliveries')
        .select('*, orders(*)')
        .eq('driver_id', driver?.id || '')
        .order('created_at', { ascending: false });

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
        accept: locale === 'ar' ? 'قبول' : 'Accept',
    };

    const renderDelivery = (delivery: NonNullable<typeof availableDeliveries>[0], showAccept = false) => {
        return (
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
                        {showAccept && (
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                                {t.accept}
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

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
                        : availableDeliveries.map(d => renderDelivery(d, true))}
                </TabsContent>
                <TabsContent value="active" className="mt-4 space-y-4">
                    {activeDeliveries.length === 0
                        ? renderEmpty()
                        : activeDeliveries.map(d => renderDelivery(d))}
                </TabsContent>
                <TabsContent value="completed" className="mt-4 space-y-4">
                    {completedDeliveries.length === 0
                        ? renderEmpty()
                        : completedDeliveries.map(d => renderDelivery(d))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
