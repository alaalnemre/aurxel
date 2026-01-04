import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';

export default async function VendorDashboard() {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Get vendor info
    const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user!.id)
        .single();

    // Get vendor statistics
    const [
        { count: productsCount },
        { count: activeProductsCount },
        { count: ordersCount },
        { data: recentOrders },
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
        supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', vendor.id)
            .eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('vendor_id', vendor.id),
        supabase
            .from('orders')
            .select('*')
            .eq('vendor_id', vendor.id)
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    // Calculate revenue
    const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .eq('vendor_id', vendor.id)
        .eq('status', 'delivered');

    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

    const stats = [
        {
            label: 'Total Products',
            value: productsCount || 0,
            icon: '📦',
            color: 'from-blue-400 to-blue-600',
        },
        {
            label: 'Active Products',
            value: activeProductsCount || 0,
            icon: '✅',
            color: 'from-green-400 to-emerald-600',
        },
        {
            label: 'Total Orders',
            value: ordersCount || 0,
            icon: '🛒',
            color: 'from-amber-400 to-orange-600',
        },
        {
            label: 'Total Revenue',
            value: `${totalRevenue.toFixed(2)} JOD`,
            icon: '💰',
            color: 'from-purple-400 to-indigo-600',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Store Dashboard</h2>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's your store performance
                </p>
            </div>

            {/* Verification Status */}
            {!vendor.is_verified && (
                <div className="bg-warning/10 border border-warning rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                        <h3 className="font-semibold text-warning">
                            Account Under Review
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Your vendor account is being reviewed by our team. You'll be notified once approved.
                        </p>
                    </div>
                </div>
            )}

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div
                                className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl shadow-lg`}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-background border border-border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
                <div className="space-y-3">
                    {recentOrders && recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                            >
                                <div>
                                    <p className="font-medium">{order.order_number}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold">
                                        {order.total.toFixed(2)} JOD
                                    </span>
                                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full capitalize">
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-4xl mb-2">📦</p>
                            <p>No orders yet</p>
                            <p className="text-sm">Start by adding products to your store!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Ready to grow your business?</h3>
                <p className="mb-4 opacity-90">Add your first product and start selling today!</p>
                <a
                    href="./products/new"
                    className="inline-block px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                >
                    Add Product →
                </a>
            </div>
        </div>
    );
}
