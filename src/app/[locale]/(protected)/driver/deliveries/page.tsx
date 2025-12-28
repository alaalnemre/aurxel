import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { DriverDeliveryActions } from './DriverDeliveryActions';

export const runtime = 'nodejs';

export default async function DriverDeliveriesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string }> }) {
    const { locale } = await params;
    const { tab } = await searchParams;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.driver_verified) redirect(`/${locale}/become-driver`);

    const supabase = await createClient();
    const { data: driver } = await supabase.from('drivers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!driver) redirect(`/${locale}/become-driver`);

    const showAvailable = tab !== 'my';

    let deliveries;
    if (showAvailable) {
        const { data } = await supabase
            .from('deliveries')
            .select(`*, orders(id, address, city, phone, total, sellers(store_name, store_address, store_city))`)
            .eq('status', 'available')
            .order('created_at', { ascending: false });
        deliveries = data;
    } else {
        const { data } = await supabase
            .from('deliveries')
            .select(`*, orders(id, address, city, phone, total, sellers(store_name, store_address, store_city))`)
            .eq('driver_id', driver.id)
            .in('status', ['assigned', 'picked_up', 'delivered'])
            .order('created_at', { ascending: false });
        deliveries = data;
    }

    return (
        <div>
            <PageHeader title={showAvailable ? t('driver.availableDeliveries') : t('driver.myDeliveries')} />

            <div className="flex gap-2 mb-6">
                <a href={`/${locale}/driver/deliveries?tab=available`} className={`px-4 py-2 rounded-lg ${showAvailable ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                    {t('driver.availableDeliveries')}
                </a>
                <a href={`/${locale}/driver/deliveries?tab=my`} className={`px-4 py-2 rounded-lg ${!showAvailable ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                    {t('driver.myDeliveries')}
                </a>
            </div>

            {deliveries && deliveries.length > 0 ? (
                <div className="space-y-4">
                    {deliveries.map((delivery) => {
                        const order = delivery.orders as { id: string; address: string; city: string; phone: string; total: number; sellers: { store_name: string; store_address: string | null; store_city: string | null } | null } | null;
                        if (!order) return null;
                        return (
                            <Card key={delivery.id}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                                            <StatusBadge status={delivery.status} type="delivery" />
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p><strong>{t('driver.pickupAddress')}:</strong> {order.sellers?.store_address}, {order.sellers?.store_city}</p>
                                            <p><strong>{t('driver.deliveryAddress')}:</strong> {order.address}, {order.city}</p>
                                            <p><strong>{t('checkout.phone')}:</strong> {order.phone}</p>
                                        </div>
                                        <p className="font-bold text-primary-600">{order.total.toFixed(2)} {t('common.currency')}</p>
                                    </div>
                                    <DriverDeliveryActions deliveryId={delivery.id} status={delivery.status} driverId={driver.id} />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    title={showAvailable ? t('driver.noAvailable') : t('driver.noDeliveries')}
                    description={showAvailable ? t('driver.noAvailableMessage') : t('driver.noDeliveriesMessage')}
                />
            )}
        </div>
    );
}
