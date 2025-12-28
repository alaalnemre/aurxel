import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations("admin");
    const profile = await getProfile();

    if (!profile?.is_admin) {
        redirect({ href: "/", locale });
    }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-900 text-white hidden lg:block">
                <div className="p-6">
                    <h2 className="text-lg font-bold">Admin Panel</h2>
                </div>
                <nav className="px-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800">{t("overview")}</Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800">{t("users")}</Link>
                    <Link href="/admin/verifications" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800">{t("verifications")}</Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800">{t("liveOrders")}</Link>
                    <Link href="/admin/wallets" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800">{t("walletsManagement")}</Link>
                    <Link href="/admin/disputes" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800">{t("disputes")}</Link>
                    <Link href="/admin/logs" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800">{t("auditLogs")}</Link>
                </nav>
            </aside>
            <main className="flex-1 bg-gray-50">{children}</main>
        </div>
    );
}
