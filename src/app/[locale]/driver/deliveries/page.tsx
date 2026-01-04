import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';

export default async function DriverDeliveriesPage() {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Get all driver deliveries
    const { data: deliveries } = await supabase
        .from('deliveries')
        .select(`
      *,
      order:orders (
        order_number,
        total,
        payment_method,
        customer:profiles!customer_id (
          full_name,
          phone
        ),
        vendor:vendors (
          business_name,
          business_phone,
          business_address
        ),
        delivery_address:addresses!delivery_address_id (
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          area
        )
      )
    `)
        .eq('driver_id', user!.id)
        .order('created_at', { ascending: false });

    const statusColors: Record<string, string> = {
        pending: 'bg-warning/20 text-warning',
        assigned: 'bg-info/20 text-info',
        picked_up: 'bg-primary/20 text-primary',
        in_transit: 'bg-accent/20 text-accent',
        delivered: 'bg-success/20 text-success',
        failed: 'bg-error/20 text-error',
    };

    const activeDeliveries = deliveries?.filter((d) =>
        ['assigned', 'picked_up', 'in_transit'].includes(d.status)
    );
    const completedDeliveries = deliveries?.filter((d) => d.status === 'delivered');

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">My Deliveries</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your delivery assignments
                </p>
            </div>

            {/* Active Deliveries */}
            {activeDeliveries && activeDeliveries.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Active Deliveries</h3>
                    <div className="space-y-4">
                        {activeDeliveries.map((delivery) => (
                            <div
                                key={delivery.id}
                                className="bg-card border-2 border-primary rounded-xl p-6"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold">{delivery.delivery_number}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Order: {delivery.order?.order_number}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-sm rounded-full capitalize ${statusColors[delivery.status]
                                            }`}
                                    >
                                        {delivery.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Delivery Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pickup */}
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">📍</span>
                                            <h5 className="font-semibold">Pickup Location</h5>
                                        </div>
                                        <p className="font-medium">{delivery.order?.vendor?.business_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {delivery.order?.vendor?.business_phone}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {delivery.order?.vendor?.business_address}
                                        </p>
                                    </div>

                                    {/* Dropoff */}
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">🏠</span>
                                            <h5 className="font-semibold">Delivery Address</h5>
                                        </div>
                                        <p className="font-medium">{delivery.order?.customer?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {delivery.order?.delivery_address?.phone}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {delivery.order?.delivery_address?.address_line1}
                                            {delivery.order?.delivery_address?.address_line2 &&
                                                `, ${delivery.order.delivery_address.address_line2}`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {delivery.order?.delivery_address?.area},{' '}
                                            {delivery.order?.delivery_address?.city}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Info */}
                                <div className="mt-4 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Order Total</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {delivery.order?.total.toFixed(2)} JOD
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Method</p>
                                        <p className="font-semibold capitalize">
                                            {delivery.order?.payment_method === 'cod' ? '💵 Cash on Delivery' : delivery.order?.payment_method}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 flex gap-2">
                                    {delivery.status === 'assigned' && (
                                        <form action={async (formData) => {
                                            'use server';
                                            const { updateDeliveryStatus } = await import('@/lib/actions/delivery');
                                            await updateDeliveryStatus(formData);
                                        }} className="flex-1">
                                            <input type="hidden" name="deliveryId" value={delivery.id} />
                                            <input type="hidden" name="status" value="picked_up" />
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                                            >
                                                Mark as Picked Up
                                            </button>
                                        </form>
                                    )}
                                    {delivery.status === 'picked_up' && (
                                        <form action={async (formData) => {
                                            'use server';
                                            const { updateDeliveryStatus } = await import('@/lib/actions/delivery');
                                            await updateDeliveryStatus(formData);
                                        }} className="flex-1">
                                            <input type="hidden" name="deliveryId" value={delivery.id} />
                                            <input type="hidden" name="status" value="in_transit" />
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                                            >
                                                Start Delivery
                                            </button>
                                        </form>
                                    )}
                                    {delivery.status === 'in_transit' && (
                                        <form action={async (formData) => {
                                            'use server';
                                            const { updateDeliveryStatus } = await import('@/lib/actions/delivery');
                                            await updateDeliveryStatus(formData);
                                        }} className="flex-1">
                                            <input type="hidden" name="deliveryId" value={delivery.id} />
                                            <input type="hidden" name="status" value="delivered" />
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-success text-white font-semibold rounded-lg hover:bg-success/90 transition-colors"
                                            >
                                                Mark as Delivered
                                            </button>
                                        </form>
                                    )}
                                    <button className="px-4 py-2 border border-border font-semibold rounded-lg hover:bg-muted transition-colors">
                                        Contact Customer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Deliveries */}
            {completedDeliveries && completedDeliveries.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Completed Deliveries</h3>
                    <div className="bg-background border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">
                                            Delivery #
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">
                                            Earning
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {completedDeliveries.map((delivery) => (
                                        <tr key={delivery.id} className="hover:bg-muted/50">
                                            <td className="px-6 py-4 font-mono text-sm">
                                                {delivery.delivery_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                {delivery.order?.customer?.full_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {delivery.order?.delivery_address?.area}
                                            </td>
                                            <td className="px-6 py-4 font-semibold">
                                                {delivery.order?.total.toFixed(2)} JOD
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(delivery.delivered_at || delivery.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-success">
                                                +2.00 JOD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!deliveries || deliveries.length === 0) && (
                <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <p className="text-6xl mb-4">📦</p>
                    <h3 className="text-xl font-semibold mb-2">No deliveries assigned</h3>
                    <p className="text-muted-foreground">
                        New delivery assignments will appear here
                    </p>
                </div>
            )}
        </div>
    );
}
