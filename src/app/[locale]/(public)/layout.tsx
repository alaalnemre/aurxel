import { Link } from "@/i18n/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getProfile } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function Header() {
    const t = await getTranslations("navigation");
    const locale = await getLocale();
    const profile = await getProfile();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#0F766E]">JordanMarket</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/store" className="text-gray-600 hover:text-[#0F766E] transition-colors">
                            {t("store")}
                        </Link>
                        {profile ? (
                            <>
                                <Link href="/buyer/orders" className="text-gray-600 hover:text-[#0F766E] transition-colors">
                                    {t("orders")}
                                </Link>
                                <Link href="/cart" className="text-gray-600 hover:text-[#0F766E] transition-colors">
                                    {t("cart")}
                                </Link>
                                <Link href="/buyer" className="text-gray-600 hover:text-[#0F766E] transition-colors">
                                    {t("profile")}
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" className="btn btn-primary text-sm py-2 px-4">
                                {t("home")}
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            locale={locale === "ar" ? "en" : "ar"}
                            className="text-sm font-medium text-gray-600 hover:text-[#0F766E]"
                        >
                            {locale === "ar" ? "EN" : "عربي"}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="min-h-[calc(100vh-64px)]">{children}</main>
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    © 2024 JordanMarket. All rights reserved.
                </div>
            </footer>
        </>
    );
}
