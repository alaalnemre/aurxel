import { createClient } from '@/lib/supabase/server';
import { getDriverCODBalance } from '@/lib/actions/delivery';

export default async function CODSettlementsPage() {
    const supabase = await createClient();

    // Get all drivers
    const { data: drivers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('full_name', { ascending: true });

    // Get COD balances for each driver
    const driverBalances = await Promise.all(
        (drivers || []).map(async (driver) => {
            const balance = await getDriverCODBalance(driver.id);

            // Count deliveries
            const { count: totalDeliveries } = await supabase
                .from('deliveries')
                .select('*', { count: 'exact', head: true })
                .eq('driver_id', driver.id)
                .eq('status', 'delivered');

            return {
                ...driver,
                codBalance: balance,
                totalDeliveries: totalDeliveries || 0,
            };
        })
    );

    // Filter drivers with COD balance > 0
    const driversWithBalance = driverBalances.filter((d) => d.codBalance > 0);
    const totalCODCollected = driverBalances.reduce((sum, d) => sum + d.codBalance, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">COD Settlements</h2>
                <p className="text-muted-foreground mt-1">
                    Track and manage Cash on Delivery collections from drivers
                </p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-600 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg opacity-90 mb-2">Total COD Collected</p>
                        <p className="text-5xl font-bold mb-4">
                            {totalCODCollected.toFixed(2)} JOD
                        </p>
                        <p className="opacity-90">
                            From {driversWithBalance.length} drivers awaiting settlement
                        </p>
                    </div>
                    <div className="text-8xl opacity-20">
                        💵
                    </div>
                </div>
            </div>

            {/* Drivers with COD Balance */}
            {driversWithBalance.length > 0 ? (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Driver Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Deliveries
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        COD Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {driversWithBalance.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                                                    🚚
                                                </div>
                                                <div>
                                                    <p className="font-medium">{driver.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        #{driver.id.slice(0, 8)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {driver.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
                                                {driver.totalDeliveries}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xl font-bold text-warning">
                                                {driver.codBalance.toFixed(2)} JOD
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                className="px-4 py-2 bg-success text-white text-sm font-semibold rounded-lg hover:bg-success/90 transition-colors"
                                                onClick={() => {
                                                    // In a real app, open a settlement modal
                                                    alert(`Recording settlement for ${driver.full_name}\nAmount: ${driver.codBalance.toFixed(2)} JOD`);
                                                }}
                                            >
                                                Record Settlement
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <p className="text-6xl mb-4">✅</p>
                    <h3 className="text-xl font-semibold mb-2">All settlements complete</h3>
                    <p className="text-muted-foreground">
                        No drivers currently have COD balance to settle
                    </p>
                </div>
            )}

            {/* All Drivers (for reference) */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">All Drivers Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Drivers</p>
                        <p className="text-2xl font-bold mt-1">{driverBalances.length}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Pending Settlement</p>
                        <p className="text-2xl font-bold mt-1 text-warning">
                            {driversWithBalance.length}
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Settled</p>
                        <p className="text-2xl font-bold mt-1 text-success">
                            {driverBalances.length - driversWithBalance.length}
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total COD</p>
                        <p className="text-2xl font-bold mt-1 text-primary">
                            {totalCODCollected.toFixed(2)} JOD
                        </p>
                    </div>
                </div>
            </div>

            {/* COD Settlement Info */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Settlement Process</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <span className="text-primary">1.</span>
                        <p>
                            Drivers collect cash payments from customers for COD orders upon delivery
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-primary">2.</span>
                        <p>
                            The system tracks the total COD amount collected by each driver
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-primary">3.</span>
                        <p>
                            Admins record settlements when drivers hand over the collected cash
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-primary">4.</span>
                        <p>
                            Settlement records are maintained for accounting and audit purposes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
