import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';

export default async function DriverDashboard() {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Get driver's delivery statistics
    const [
        { count: totalDeliveries },
        { count: completedDeliveries },
        { count: pendingDeliveries },
        { data: recentDeliveries },
    ] = await Promise.all([
        supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', user!.id),
        supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', user!.id)
            .eq('status', 'delivered'),
        supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', user!.id)
            .in('status', ['pending', 'assigned', 'picked_up', 'in_transit']),
        supabase
            .from('deliveries')
            .select(`
        *,
        order:orders (
          order_number,
          total,
          customer:profiles!customer_id (
            full_name,
            phone
          ),
          delivery_address:addresses!delivery_address_id (
            address_line1,
            city,
            area
          )
        )
      `)
            .eq('driver_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    // Calculate earnings (simple: 2 JOD per delivery)
    const totalEarnings = (completedDeliveries || 0) * 2.0;
    const successRate =
        totalDeliveries && totalDeliveries > 0
            ? ((completedDeliveries || 0) / totalDeliveries) * 100
            : 0;

    const stats = [
        {
            label: 'Total Deliveries',
            value: totalDeliveries || 0,
            icon: '📦',
            color: 'from-blue-400 to-blue-600',
        },
        {
            label: 'Completed',
            value: completedDeliveries || 0,
            icon: '✅',
            color: 'from-green-400 to-emerald-600',
        },
        {
            label: 'Pending',
            value: pendingDeliveries || 0,
            icon: '🚚',
            color: 'from-amber-400 to-orange-600',
        },
        {
            label: 'Total Earnings',
            value: `${totalEarnings.toFixed(2)} JOD`,
            icon: '💰',
            color: 'from-purple-400 to-indigo-600',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Driver Dashboard</h2>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's your delivery overview
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

            {/* Success Rate */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Success Rate</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                                Delivery Success Rate
                            </span>
                            <span className="text-sm font-semibold">{successRate.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-success to-primary transition-all"
                                style={{ width: `${successRate}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center text-white">
                            <div>
                                <p className="text-2xl font-bold">{successRate.toFixed(0)}</p>
                                <p className="text-xs">%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Deliveries */}
            <div className="bg-background border border-border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Deliveries</h3>
                <div className="space-y-3">
                    {recentDeliveries && recentDeliveries.length > 0 ? (
                        recentDeliveries.map((delivery) => (
                            <div
                                key={delivery.id}
                                className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-medium">{delivery.delivery_number}</p>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full capitalize ${delivery.status === 'delivered'
                                                    ? 'bg-success/20 text-success'
                                                    : delivery.status === 'in_transit'
                                                        ? 'bg-primary/20 text-primary'
                                                        : 'bg-warning/20 text-warning'
                                                }`}
                                        >
                                            {delivery.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Customer: {delivery.order?.customer?.full_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {delivery.order?.delivery_address?.area},{' '}
                                        {delivery.order?.delivery_address?.city}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-primary">
                                        {delivery.order?.total.toFixed(2)} JOD
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(delivery.created_at).toLocaleDateString('en-GB')}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-4xl mb-2">📦</p>
                            <p>No deliveries yet</p>
                            <p className="text-sm">Check back for new assignments!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Ready to deliver?</h3>
                <p className="mb-4 opacity-90">
                    Check your assigned deliveries and start earning today!
                </p>
                <a
                    href="./deliveries"
                    className="inline-block px-6 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                >
                    View Deliveries →
                </a>
            </div>
        </div>
    );
}
