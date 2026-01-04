import { createClient } from '@/lib/supabase/server';

export default async function OrdersPage() {
    const supabase = await createClient();

    // Fetch all orders with customer, vendor, and delivery info
    const { data: orders } = await supabase
        .from('orders')
        .select(`
      *,
      customer:profiles!customer_id (
        full_name,
        phone
      ),
      vendor:vendors (
        business_name,
        business_phone
      )
    `)
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
        refunded: 'bg-muted-foreground/20 text-muted-foreground',
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Order Monitoring</h2>
                <p className="text-muted-foreground mt-1">
                    Track and manage all orders across the platform
                </p>
            </div>

            {/* Orders Table */}
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
                                    Vendor
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
                            {orders && orders.length > 0 ? (
                                orders.map((order) => (
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
                                        <td className="px-6 py-4">
                                            {order.vendor?.business_name}
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
                                            <button className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-8 text-center text-muted-foreground"
                                    >
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold mt-1">{orders?.length || 0}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        {orders?.filter((o) => o.status === 'pending').length || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold mt-1 text-primary">
                        {orders?.filter((o) => ['confirmed', 'preparing', 'ready', 'picked_up', 'in_transit'].includes(o.status)).length || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        {orders?.filter((o) => o.status === 'delivered').length || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1 text-primary">
                        {orders?.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2) || 0} JOD
                    </p>
                </div>
            </div>
        </div>
    );
}
