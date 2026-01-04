import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ShopPage() {
    const supabase = await createClient();
    const t = await getTranslations('shop');

    // Get all active products from verified vendors
    const { data: products } = await supabase
        .from('products')
        .select(`
      *,
      vendor:vendors (
        id,
        business_name,
        business_name_ar,
        category,
        is_verified,
        rating_average
      )
    `)
        .eq('is_active', true)
        .eq('vendor.is_verified', true)
        .order('created_at', { ascending: false })
        .limit(50);

    // Get featured vendors
    const { data: featuredVendors } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_verified', true)
        .eq('is_active', true)
        .order('rating_average', { ascending: false })
        .limit(6);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary via-accent to-secondary text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Discover Jordan's Best Marketplace 🇯🇴
                        </h1>
                        <p className="text-xl opacity-90 mb-8">
                            Shop from verified local vendors. Fast delivery. Cash on Delivery available.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-lg p-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="Search for products, vendors, categories..."
                                className="flex-1 px-4 py-2 text-gray-900 outline-none"
                            />
                            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Categories */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {[
                            { name: 'Shop', icon: '🛍️', color: 'from-blue-400 to-blue-600' },
                            { name: 'Food', icon: '🍔', color: 'from-orange-400 to-red-600' },
                            { name: 'Pharmacy', icon: '💊', color: 'from-green-400 to-emerald-600' },
                            { name: 'Grocery', icon: '🥬', color: 'from-lime-400 to-green-600' },
                            { name: 'Parcel', icon: '📦', color: 'from-amber-400 to-orange-600' },
                            { name: 'Rental', icon: '🚗', color: 'from-purple-400 to-indigo-600' },
                        ].map((category) => (
                            <button
                                key={category.name}
                                className="bg-card rounded-xl p-4 text-center hover:shadow-lg transition-all transform hover:-translate-y-1 border border-border"
                            >
                                <div className={`text-4xl mb-2 bg-gradient-to-br ${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto`}>
                                    {category.icon}
                                </div>
                                <p className="font-medium text-sm">{category.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Vendors */}
                {featuredVendors && featuredVendors.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Top Rated Vendors</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {featuredVendors.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    href={`./vendors/${vendor.id}`}
                                    className="bg-card rounded-xl p-4 text-center hover:shadow-lg transition-all border border-border"
                                >
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                                        🏪
                                    </div>
                                    <p className="font-semibold text-sm line-clamp-1">
                                        {vendor.business_name}
                                    </p>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        <span className="text-amber-500">★</span>
                                        <span className="text-xs font-medium">
                                            {vendor.rating_average.toFixed(1)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">All Products</h2>
                        <select className="px-4 py-2 border border-border rounded-lg">
                            <option>Sort by: Newest</option>
                            <option>Sort by: Price (Low to High)</option>
                            <option>Sort by: Price (High to Low)</option>
                            <option>Sort by: Rating</option>
                        </select>
                    </div>

                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`./shop/${product.id}`}
                                    className="bg-card rounded-xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-border"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-muted flex items-center justify-center">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-6xl">📦</span>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                                            {product.name}
                                        </h3>

                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                            {product.vendor?.business_name}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-primary">
                                                {product.price.toFixed(2)} JOD
                                            </span>
                                            {product.compare_at_price && (
                                                <span className="text-xs text-muted-foreground line-through">
                                                    {product.compare_at_price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card rounded-xl border border-border">
                            <p className="text-6xl mb-4">📦</p>
                            <h3 className="text-xl font-semibold mb-2">No products available</h3>
                            <p className="text-muted-foreground">
                                Check back soon for new arrivals!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
