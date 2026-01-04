import { createClient } from '@/lib/supabase/server';
import { verifyDriver } from '@/lib/actions/admin';

export default async function DriversPage() {
    const supabase = await createClient();

    // Fetch all driver profiles
    const { data: drivers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false });

    // Get delivery stats for each driver
    const driverStats = await Promise.all(
        (drivers || []).map(async (driver) => {
            const { count: totalDeliveries } = await supabase
                .from('deliveries')
                .select('*', { count: 'exact', head: true })
                .eq('driver_id', driver.id);

            const { count: completedDeliveries } = await supabase
                .from('deliveries')
                .select('*', { count: 'exact', head: true })
                .eq('driver_id', driver.id)
                .eq('status', 'delivered');

            return {
                ...driver,
                totalDeliveries: totalDeliveries || 0,
                completedDeliveries: completedDeliveries || 0,
            };
        })
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Driver Management</h2>
                <p className="text-muted-foreground mt-1">
                    Manage and verify delivery drivers
                </p>
            </div>

            {/* Drivers Table */}
            <div className="bg-background border border-border rounded-xl overflow-hidden">
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
                                    Total Deliveries
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Completed
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Success Rate
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {driverStats && driverStats.length > 0 ? (
                                driverStats.map((driver) => {
                                    const successRate =
                                        driver.totalDeliveries > 0
                                            ? (
                                                (driver.completedDeliveries / driver.totalDeliveries) *
                                                100
                                            ).toFixed(0)
                                            : '0';

                                    return (
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
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-success/20 text-success rounded-full font-semibold">
                                                    {driver.completedDeliveries}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-success to-primary transition-all"
                                                            style={{ width: `${successRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold w-12">
                                                        {successRate}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(driver.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <form action={verifyDriver}>
                                                        <input type="hidden" name="driverId" value={driver.id} />
                                                        <button
                                                            type="submit"
                                                            className="px-3 py-1.5 bg-success text-white text-sm rounded-lg hover:bg-success/90 transition-colors"
                                                        >
                                                            Verify
                                                        </button>
                                                    </form>
                                                    <button className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors">
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-8 text-center text-muted-foreground"
                                    >
                                        No drivers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Drivers</p>
                    <p className="text-2xl font-bold mt-1">{driverStats?.length || 0}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        {driverStats?.filter((d) => d.totalDeliveries > 0).length || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Deliveries</p>
                    <p className="text-2xl font-bold mt-1 text-primary">
                        {driverStats?.reduce((sum, d) => sum + d.totalDeliveries, 0) || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        {Math.round(
                            driverStats?.reduce((sum, d) => {
                                const rate =
                                    d.totalDeliveries > 0
                                        ? (d.completedDeliveries / d.totalDeliveries) * 100
                                        : 0;
                                return sum + rate;
                            }, 0) / (driverStats?.length || 1)
                        ) || 0}
                        %
                    </p>
                </div>
            </div>
        </div>
    );
}
