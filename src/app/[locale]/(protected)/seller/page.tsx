import { getSellerProducts } from "@/actions/products";
import { getSellerOrders } from "@/actions/orders";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent, OrderStatusBadge } from "@/components/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SellerDashboard() {
    const t = await getTranslations("seller");
    const productsResult = await getSellerProducts();
    const ordersResult = await getSellerOrders();

    const products = productsResult.success ? productsResult.data?.products || [] : [];
    const orders = ordersResult.success ? ordersResult.data || [] : [];
    const pendingOrders = orders.filter((o) => o.status === "placed");

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">{t("dashboard")}</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <p className="text-sm text-gray-500">{t("products")}</p>
                    <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">{t("pendingOrders")}</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingOrders.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">{t("totalEarnings")}</p>
                    <p className="text-3xl font-bold text-[#0F766E]">
                        {orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.total), 0).toFixed(2)} JOD
                    </p>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-8">
                <Link href="/seller/products/new" className="btn btn-primary">
                    + {t("addProduct")}
                </Link>
                <Link href="/seller/products" className="btn btn-secondary">
                    {t("products")}
                </Link>
            </div>

            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-amber-600">⚠️ {t("pendingOrders")} ({pendingOrders.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingOrders.slice(0, 5).map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/seller/orders/${order.id}`}
                                    className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">#{order.order_number}</p>
                                        <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{Number(order.total).toFixed(2)} JOD</p>
                                        <OrderStatusBadge status={order.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Products */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t("products")}</CardTitle>
                        <Link href="/seller/products" className="text-sm text-[#0F766E] hover:underline">View all</Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {products.length > 0 ? (
                        <div className="space-y-3">
                            {products.slice(0, 5).map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{product.name}</p>
                                        <p className="text-sm text-gray-500">{Number(product.base_price).toFixed(2)} JOD • Stock: {product.stock_quantity}</p>
                                    </div>
                                    <Link href={`/seller/products/${product.id}`} className="text-sm text-[#0F766E] hover:underline">Edit</Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No products yet. Add your first product!</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
