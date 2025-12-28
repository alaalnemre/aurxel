import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#0D5D56] text-white overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 bg-white text-[#0F766E] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                {t("hero.cta")}
                <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
              >
                {tCommon("appName")}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section >

      {/* Features Section */}
      < section className="py-20 bg-gray-50" >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t("features.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* COD */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#0F766E]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t("features.cod.title")}</h3>
              <p className="text-gray-600">{t("features.cod.description")}</p>
            </div>

            {/* Local Sellers */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t("features.localSellers.title")}</h3>
              <p className="text-gray-600">{t("features.localSellers.description")}</p>
            </div>

            {/* Fast Delivery */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t("features.fastDelivery.title")}</h3>
              <p className="text-gray-600">{t("features.fastDelivery.description")}</p>
            </div>

            {/* Rewards */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t("features.rewards.title")}</h3>
              <p className="text-gray-600">{t("features.rewards.description")}</p>
            </div>
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-20 bg-white" >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to Start Shopping?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of happy customers and discover amazing products from local sellers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 bg-[#0F766E] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#0D5D56] transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/become-seller"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section >
    </div >
  );
}
