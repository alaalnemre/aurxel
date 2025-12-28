import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations("driver");
    const profile = await getProfile();

    if (!profile?.is_driver) {
        redirect({ href: "/become-driver", locale });
    }

    if (!profile?.driver_verified) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h1>
                    <p className="text-gray-600">Your driver account is pending verification.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900">{t("dashboard")}</h2>
                </div>
                <nav className="px-4 space-y-1">
                    <Link href="/driver" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">Overview</Link>
                    <Link href="/driver/available" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">{t("availableDeliveries")}</Link>
                    <Link href="/driver/active" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">{t("activeDelivery")}</Link>
                    <Link href="/driver/history" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">{t("deliveryHistory")}</Link>
                    <Link href="/driver/earnings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">{t("earnings")}</Link>
                </nav>
            </aside>
            <main className="flex-1 bg-gray-50">{children}</main>
        </div>
    );
}
