import { getProfile } from "@/lib/supabase/server";
import { getWallet, getCoinsBalance } from "@/actions/wallet";
import { getOrders } from "@/actions/orders";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent, OrderStatusBadge } from "@/components/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BuyerDashboard() {
    const t = await getTranslations();
    const locale = await getLocale();
    const profile = await getProfile();
    const walletResult = await getWallet();
    const coinsResult = await getCoinsBalance();
    const ordersResult = await getOrders();

    const wallet = walletResult.success ? walletResult.data : null;
    const coins = coinsResult.success ? coinsResult.data : 0;
    const orders = ordersResult.success ? ordersResult.data?.slice(0, 5) : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
                {t("auth.welcomeBack")}, {profile?.full_name}
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t("wallet.balance")}</p>
                            <p className="text-2xl font-bold text-gray-900">{Number(wallet?.balance || 0).toFixed(2)} JOD</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t("coins.balance")}</p>
                            <p className="text-2xl font-bold text-gray-900">{coins} QANZ</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t("orders.title")}</p>
                            <p className="text-2xl font-bold text-gray-900">{ordersResult.data?.length || 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Link href="/store" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-sm font-medium">{t("navigation.store")}</span>
                </Link>
                <Link href="/buyer/orders" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium">{t("navigation.orders")}</span>
                </Link>
                <Link href="/buyer/wallet" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium">{t("navigation.wallet")}</span>
                </Link>
                <Link href="/buyer/notifications" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="text-sm font-medium">{t("navigation.notifications")}</span>
                </Link>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t("orders.orderHistory")}</CardTitle>
                        <Link href="/buyer/orders" className="text-sm text-[#0F766E] hover:underline">
                            View all
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {orders && orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/buyer/orders/${order.id}`}
                                    className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">#{order.order_number}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString(locale === "ar" ? "ar-JO" : "en-US")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">{Number(order.total).toFixed(2)} JOD</p>
                                            <OrderStatusBadge status={order.status} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t("orders.noOrders")}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
