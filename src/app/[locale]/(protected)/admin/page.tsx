import { adminGetAllProfiles } from "@/actions/profile";
import { adminGetDisputes } from "@/actions/disputes";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const t = await getTranslations("admin");
    const allUsersResult = await adminGetAllProfiles();
    const pendingSellersResult = await adminGetAllProfiles({ filter: "pending_sellers" });
    const pendingDriversResult = await adminGetAllProfiles({ filter: "pending_drivers" });
    const disputesResult = await adminGetDisputes("open");

    const totalUsers = allUsersResult.success ? allUsersResult.data?.total || 0 : 0;
    const pendingSellers = pendingSellersResult.success ? pendingSellersResult.data?.total || 0 : 0;
    const pendingDrivers = pendingDriversResult.success ? pendingDriversResult.data?.total || 0 : 0;
    const openDisputes = disputesResult.success ? disputesResult.data?.length || 0 : 0;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("dashboard")}</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <p className="text-sm text-gray-500">{t("statistics.totalUsers")}</p>
                    <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">{t("statistics.pendingVerifications")}</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingSellers + pendingDrivers}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">{t("openDisputes")}</p>
                    <p className="text-3xl font-bold text-red-600">{openDisputes}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">{t("statistics.activeDeliveries")}</p>
                    <p className="text-3xl font-bold text-[#0F766E]">-</p>
                </Card>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Verifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("verifications")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Link href="/admin/verifications?type=sellers" className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100">
                                <span>{t("sellerVerifications")}</span>
                                <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">{pendingSellers}</span>
                            </Link>
                            <Link href="/admin/verifications?type=drivers" className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100">
                                <span>{t("driverVerifications")}</span>
                                <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">{pendingDrivers}</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admin/users" className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 text-center">{t("allUsers")}</Link>
                            <Link href="/admin/orders" className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 text-center">{t("liveOrders")}</Link>
                            <Link href="/admin/wallets" className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 text-center">{t("walletsManagement")}</Link>
                            <Link href="/admin/logs" className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 text-center">{t("auditLogs")}</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
