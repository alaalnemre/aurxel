import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

export default async function AdminDashboard() {
    const supabase = await createClient();
    const t = await getTranslations('admin');

    // Fetch platform statistics
    const [
        { count: vendorsCount },
        { count: productsCount },
        { count: ordersCount },
        { count: driversCount },
    ] = await Promise.all([
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
    ]);

    // Fetch recent vendors for approval
    const { data: recentVendors } = await supabase
        .from('vendors')
        .select(`
      id,
      business_name,
      category,
      is_verified,
      created_at,
      user_id
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch recent orders
    const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
      id,
      order_number,
      total,
      status,
      created_at
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    const stats = [
        {
            label: 'Total Vendors',
            value: vendorsCount || 0,
            icon: '🏪',
            color: 'from-blue-400 to-blue-600',
        },
        {
            label: 'Total Products',
            value: productsCount || 0,
            icon: '📦',
            color: 'from-green-400 to-emerald-600',
        },
        {
            label: 'Total Orders',
            value: ordersCount || 0,
            icon: '🛒',
            color: 'from-amber-400 to-orange-600',
        },
        {
            label: 'Total Drivers',
            value: driversCount || 0,
            icon: '🚚',
            color: 'from-purple-400 to-indigo-600',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Platform Overview</h2>
                <p className="text-muted-foreground mt-1">
                    Monitor and manage your multi-vendor marketplace
                </p>
            </div>

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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Vendors */}
                <div className="bg-background border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Vendors</h3>
                    <div className="space-y-3">
                        {recentVendors && recentVendors.length > 0 ? (
                            recentVendors.map((vendor) => (
                                <div
                                    key={vendor.id}
                                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                                >
                                    <div>
                                        <p className="font-medium">{vendor.business_name}</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {vendor.category}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {vendor.is_verified ? (
                                            <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                                                ✓ Verified
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">
                                                ⏳ Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">
                                No vendors yet
                            </p>
                        )}
                    </div>
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
                                            {order.total.toFixed(2)} JOD
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full capitalize">
                                        {order.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">
                                No orders yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
