import { getAvailableDeliveries, getActiveDelivery, getDriverStats } from "@/actions/deliveries";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent, DeliveryStatusBadge } from "@/components/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
    const t = await getTranslations("driver");
    const activeResult = await getActiveDelivery();
    const availableResult = await getAvailableDeliveries();
    const statsResult = await getDriverStats();

    const activeDelivery = activeResult.success ? activeResult.data : null;
    const availableDeliveries = availableResult.success ? availableResult.data || [] : [];
    const stats = statsResult.success ? statsResult.data : { totalDeliveries: 0, totalEarnings: 0, totalTips: 0, rating: 0 };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("dashboard")}</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <p className="text-sm text-gray-500">Total Deliveries</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalDeliveries}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">{t("earnings")}</p>
                    <p className="text-3xl font-bold text-[#0F766E]">{stats?.totalEarnings.toFixed(2)} JOD</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">{t("tips")}</p>
                    <p className="text-3xl font-bold text-amber-600">{stats?.totalTips.toFixed(2)} JOD</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.rating.toFixed(1)} ⭐</p>
                </Card>
            </div>

            {/* Active Delivery */}
            {activeDelivery && (
                <Card className="mb-8 border-2 border-[#0F766E]">
                    <CardHeader>
                        <CardTitle className="text-[#0F766E]">🚗 {t("activeDelivery")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Order #{activeDelivery.order?.order_number}</p>
                                <p className="text-sm text-gray-500">{Number(activeDelivery.order?.total || 0).toFixed(2)} JOD</p>
                            </div>
                            <div className="text-right">
                                <DeliveryStatusBadge status={activeDelivery.status} />
                                <Link href="/driver/active" className="block mt-2 text-sm text-[#0F766E] hover:underline">View Details</Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Deliveries */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t("availableDeliveries")} ({availableDeliveries.length})</CardTitle>
                        <Link href="/driver/available" className="text-sm text-[#0F766E] hover:underline">View all</Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {availableDeliveries.length > 0 ? (
                        <div className="space-y-3">
                            {availableDeliveries.slice(0, 5).map((delivery) => (
                                <Link
                                    key={delivery.id}
                                    href={`/driver/available/${delivery.id}`}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">#{delivery.order?.order_number}</p>
                                        <p className="text-sm text-gray-500">{Number(delivery.order?.total || 0).toFixed(2)} JOD</p>
                                    </div>
                                    <span className="btn btn-primary text-sm py-1.5 px-3">{t("claimDelivery")}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t("noActiveDelivery")}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
