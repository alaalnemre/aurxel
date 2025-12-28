import { redirect } from "@/i18n/navigation";
import { getProfile, getUser } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();
    const locale = (await getLocale()) as Locale;

    if (!user) {
        redirect({ href: "/login", locale });
    }

    const profile = await getProfile();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#0F766E]">JordanMarket</span>
                        </Link>

                        <nav className="flex items-center gap-4">
                            <Link href="/store" className="text-gray-600 hover:text-[#0F766E] text-sm">
                                Store
                            </Link>
                            <Link href="/buyer" className="text-gray-600 hover:text-[#0F766E] text-sm">
                                Dashboard
                            </Link>
                            <Link
                                href="/"
                                locale={locale === "ar" ? "en" : "ar"}
                                className="text-sm font-medium text-gray-600 hover:text-[#0F766E]"
                            >
                                {locale === "ar" ? "EN" : "عربي"}
                            </Link>
                            <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-sm font-medium">
                                {profile?.full_name?.charAt(0) || "U"}
                            </div>
                        </nav>
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}
