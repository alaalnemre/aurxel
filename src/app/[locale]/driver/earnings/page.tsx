import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';

export default async function DriverEarningsPage() {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Get all completed deliveries
    const { data: completedDeliveries } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', user!.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

    // Simple earnings calculation: 2 JOD per delivery
    const earningsPerDelivery = 2.0;
    const totalDeliveries = completedDeliveries?.length || 0;
    const totalEarnings = totalDeliveries * earningsPerDelivery;

    // Group by month for earnings breakdown
    const earningsByMonth: Record<string, number> = {};
    completedDeliveries?.forEach((delivery) => {
        const month = new Date(delivery.delivered_at || delivery.created_at).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
        });
        earningsByMonth[month] = (earningsByMonth[month] || 0) + earningsPerDelivery;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Earnings</h2>
                <p className="text-muted-foreground mt-1">
                    Track your delivery earnings and performance
                </p>
            </div>

            {/* Total Earnings Card */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg opacity-90 mb-2">Total Earnings</p>
                        <p className="text-5xl font-bold mb-4">
                            {totalEarnings.toFixed(2)} JOD
                        </p>
                        <p className="opacity-90">
                            From {totalDeliveries} completed deliveries
                        </p>
                    </div>
                    <div className="text-8xl opacity-20">
                        💰
                    </div>
                </div>
            </div>

            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm text-muted-foreground">Per Delivery</p>
                    <p className="text-3xl font-bold mt-1 text-primary">
                        {earningsPerDelivery.toFixed(2)} JOD
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm text-muted-foreground">Total Deliveries</p>
                    <p className="text-3xl font-bold mt-1">{totalDeliveries}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm text-muted-foreground">Average per Day</p>
                    <p className="text-3xl font-bold mt-1 text-success">
                        {totalDeliveries > 0 ? Math.round(totalDeliveries / 30) : 0}
                    </p>
                </div>
            </div>

            {/* Earnings by Month */}
            {Object.keys(earningsByMonth).length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Earnings by Month</h3>
                    <div className="space-y-4">
                        {Object.entries(earningsByMonth).map(([month, amount]) => {
                            const deliveryCount = amount / earningsPerDelivery;
                            return (
                                <div key={month} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-semibold">{month}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {deliveryCount} deliveries
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-primary">
                                        {amount.toFixed(2)} JOD
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payment Information */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-info/10 border border-info rounded-lg">
                        <p className="text-sm font-medium text-info mb-2">
                            💳 Payment Schedule
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Earnings are paid out weekly every Monday via bank transfer. Ensure your bank details are up to date in your profile.
                        </p>
                    </div>
                    <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                        <p className="text-sm font-medium text-warning mb-2">
                            ⚠️ Pending Payout
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Current balance: <span className="font-semibold">{totalEarnings.toFixed(2)} JOD</span>
                            <br />
                            Next payout date: Monday
                        </p>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {totalDeliveries === 0 && (
                <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <p className="text-6xl mb-4">💰</p>
                    <h3 className="text-xl font-semibold mb-2">No earnings yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Complete deliveries to start earning
                    </p>
                    <a
                        href="../deliveries"
                        className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        View Deliveries
                    </a>
                </div>
            )}
        </div>
    );
}
