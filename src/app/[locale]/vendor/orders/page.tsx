import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { updateOrderStatus } from '@/lib/actions/vendor';

export default async function VendorOrdersPage() {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Get vendor info
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user!.id)
        .single();

    if (!vendor) {
        return <div>Vendor not found</div>;
    }

    // Get all vendor orders with customer  info
    const { data: orders } = await supabase
        .from('orders')
        .select(`
      *,
      customer:profiles!customer_id (
        full_name,
        phone
      ),
      delivery_address:addresses!delivery_address_id (
        address_line1,
        city,
        phone
      )
    `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

    const statusColors: Record<string, string> = {
        pending: 'bg-warning/20 text-warning',
        confirmed: 'bg-info/20 text-info',
        preparing: 'bg-primary/20 text-primary',
        ready: 'bg-accent/20 text-accent',
        picked_up: 'bg-secondary/20 text-secondary',
        in_transit: 'bg-indigo-500/20 text-indigo-600',
        delivered: 'bg-success/20 text-success',
        cancelled: 'bg-error/20 text-error',
    };

    const nextStatus: Record<string, string> = {
        pending: 'confirmed',
        confirmed: 'preparing',
        preparing: 'ready',
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Order Management</h2>
                <p className="text-muted-foreground mt-1">
                    Manage and fulfill your orders
                </p>
            </div>

            {/* Orders Table */}
            {orders && orders.length > 0 ? (
                <div className="bg-background border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Order #
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4 font-mono text-sm">
                                            {order.order_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium">
                                                    {order.customer?.full_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.customer?.phone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold">
                                            {order.total.toFixed(2)} JOD
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[order.status] || 'bg-muted'
                                                    }`}
                                            >
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {nextStatus[order.status] && (
                                                    <form action={updateOrderStatus}>
                                                        <input type="hidden" name="orderId" value={order.id} />
                                                        <input
                                                            type="hidden"
                                                            name="status"
                                                            value={nextStatus[order.status]}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors capitalize"
                                                        >
                                                            → {nextStatus[order.status]}
                                                        </button>
                                                    </form>
                                                )}
                                                <button className="px-3 py-1.5 border border-border text-sm rounded-lg hover:bg-muted transition-colors">
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-background border border-border rounded-xl">
                    <p className="text-6xl mb-4">🛒</p>
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">
                        Orders will appear here when customers make purchases
                    </p>
                </div>
            )}

            {/* Summary Stats */}
            {orders && orders.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold mt-1">{orders.length}</p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold mt-1 text-warning">
                            {orders.filter((o) => o.status === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold mt-1 text-primary">
                            {orders.filter((o) =>
                                ['confirmed', 'preparing', 'ready'].includes(o.status)
                            ).length}
                        </p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold mt-1 text-success">
                            {orders.filter((o) => o.status === 'delivered').length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
