import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function OrdersPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Get customer orders
    const { data: orders } = await supabase
        .from('orders')
        .select(`
      *,
      vendor:vendors (
        business_name,
        business_phone
      )
    `)
        .eq('customer_id', user.id)
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

    return (
        <div className="min-h-screen bg-background py-8">
            < div className="container mx-auto px-4 max-w-6xl" >
                {/* Page Header */}
                < div className="mb-8" >
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage your orders
                    </p>
                </div >

                {/* Orders List */}
                {
                    orders && orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`./orders/${order.id}`}
                                    className="block bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Order Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    Order {order.order_number}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 text-xs rounded-full capitalize ${statusColors[order.status] || 'bg-muted'
                                                        }`}
                                                >
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                From: {order.vendor?.business_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Placed on {new Date(order.created_at).toLocaleDateString('en-GB', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>

                                        {/* Order Total */}
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground mb-1">Total</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {order.total.toFixed(2)} JOD
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden md:block text-muted-foreground">
                                            →
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    {order.status === 'delivered' && (
                                        <div className="mt-4 pt-4 border-t border-border flex gap-2">
                                            <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors">
                                                Reorder
                                            </button>
                                            <button className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-muted transition-colors">
                                                Leave Review
                                            </button>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card border border-border rounded-xl">
                            <p className="text-6xl mb-4">📦</p>
                            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Start shopping to see your orders here
                            </p>
                            <a
                                href="../shop"
                                className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                            >
                                Start Shopping
                            </a>
                        </div>
                    )
                }

                {/* Order Stats */}
                {
                    orders && orders.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-card border border-border rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold mt-1">{orders.length}</p>
                            </div>
                            <div className="bg-card border border-border rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Delivered</p>
                                <p className="text-2xl font-bold mt-1 text-success">
                                    {orders.filter((o) => o.status === 'delivered').length}
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold mt-1 text-primary">
                                    {orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length}
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">Total Spent</p>
                                <p className="text-2xl font-bold mt-1 text-primary">
                                    {orders.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2)} JOD
                                </p>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
