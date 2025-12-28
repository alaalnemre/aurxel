import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations("seller");
    const profile = await getProfile();

    if (!profile?.is_seller) {
        redirect({ href: "/become-seller", locale });
    }

    if (!profile?.seller_verified) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("verificationStatus")}</h1>
                    <p className="text-gray-600 mb-6">Your seller account is pending verification. You will be notified once approved.</p>
                    <Link href="/store" className="text-[#0F766E] hover:underline">
                        Continue shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900">{t("dashboard")}</h2>
                </div>
                <nav className="px-4 space-y-1">
                    <Link href="/seller" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Overview
                    </Link>
                    <Link href="/seller/products" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {t("products")}
                    </Link>
                    <Link href="/seller/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {t("fulfillOrders")}
                    </Link>
                    <Link href="/seller/earnings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t("earnings")}
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50">{children}</main>
        </div>
    );
}
