import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function VendorStorePage({
    params,
}: {
    params: { id: string; locale: string };
}) {
    const { id, locale } = params;
    const supabase = await createClient();

    // Get vendor info
    const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (!vendor || !vendor.is_verified) {
        notFound();
    }

    // Get vendor products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const isArabic = locale === 'ar';

    return (
        <div className="min-h-screen bg-background">
            {/* Vendor Banner */}
            <div className="relative h-48 bg-gradient-to-r from-primary via-accent to-secondary">
                {vendor.banner_url ? (
                    <img
                        src={vendor.banner_url}
                        alt={vendor.business_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-9xl">
                        🏪
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Vendor Info Card */}
            <div className="container mx-auto px-4">
                <div className="relative -mt-16 bg-card rounded-2xl shadow-xl border border-border p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            {vendor.logo_url ? (
                                <img
                                    src={vendor.logo_url}
                                    alt={vendor.business_name}
                                    className="w-32 h-32 rounded-xl object-cover border-4 border-background shadow-lg"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl shadow-lg">
                                    🏪
                                </div>
                            )}
                        </div>

                        {/* Vendor Details */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h1 className="text-3xl font-bold mb-1">
                                        {isArabic && vendor.business_name_ar
                                            ? vendor.business_name_ar
                                            : vendor.business_name}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm capitalize">
                                            {vendor.category}
                                        </span>
                                        {vendor.is_verified && (
                                            <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm">
                                                ✓ Verified Store
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {(vendor.description || vendor.description_ar) && (
                                <p className="text-muted-foreground mb-4">
                                    {isArabic && vendor.description_ar
                                        ? vendor.description_ar
                                        : vendor.description}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Rating</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-amber-500 text-lg">★</span>
                                        <span className="font-bold">
                                            {vendor.rating_average.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            ({vendor.rating_count})
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Products</p>
                                    <p className="font-bold text-lg">{products?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{vendor.business_phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium text-sm line-clamp-1">
                                        {isArabic && vendor.business_address_ar
                                            ? vendor.business_address_ar
                                            : vendor.business_address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="py-8">
                    <h2 className="text-2xl font-bold mb-6">
                        Products from {vendor.business_name}
                    </h2>

                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`../shop/${product.id}`}
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
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                                            {product.name}
                                        </h3>

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
                            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                            <p className="text-muted-foreground">
                                This store hasn't listed any products yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
