import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    const { id, locale } = await params;
    const supabase = await createClient();

    // Get product with vendor info
    const { data: product } = await supabase
        .from('products')
        .select(`
      *,
      vendor:vendors (
        id,
        business_name,
        business_name_ar,
        business_phone,
        business_address,
        category,
        is_verified,
        rating_average,
        rating_count
      )
    `)
        .eq('id', id)
        .maybeSingle();

    if (!product) {
        notFound();
    }

    const isArabic = locale === 'ar';

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link href="./shop" className="hover:text-primary">
                        Shop
                    </Link>
                    <span>›</span>
                    <Link href={`./shop?category=${product.category}`} className="hover:text-primary capitalize">
                        {product.category}
                    </Link>
                    <span>›</span>
                    <span className="text-foreground">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="bg-card rounded-2xl overflow-hidden border border-border">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-9xl">📦</span>
                            )}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        {/* Title & Price */}
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isArabic && product.name_ar ? product.name_ar : product.name}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-primary">
                                    {product.price.toFixed(2)} JOD
                                </span>
                                {product.compare_at_price && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        {product.compare_at_price.toFixed(2)} JOD
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {(product.description || product.description_ar) && (
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground">
                                    {isArabic && product.description_ar
                                        ? product.description_ar
                                        : product.description}
                                </p>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div>
                            <h3 className="font-semibold mb-2">Availability</h3>
                            {product.stock_quantity > 0 ? (
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-success rounded-full"></span>
                                    <span className="text-success font-medium">
                                        In Stock ({product.stock_quantity} available)
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-error rounded-full"></span>
                                    <span className="text-error font-medium">Out of Stock</span>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart */}
                        <div className="space-y-3">
                            <button
                                disabled={product.stock_quantity === 0}
                                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🛒 Add to Cart
                            </button>
                            <button className="w-full py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors">
                                ❤️ Add to Wishlist
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">SKU:</span>
                                <span className="font-medium">{product.sku || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="font-medium capitalize">{product.category}</span>
                            </div>
                            {product.subcategory && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subcategory:</span>
                                    <span className="font-medium capitalize">{product.subcategory}</span>
                                </div>
                            )}
                        </div>

                        {/* Vendor Info */}
                        <div className="bg-card border border-border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Sold by</h3>
                            <Link
                                href={`../vendors/${product.vendor.id}`}
                                className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg transition-colors"
                            >
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-xl">
                                    🏪
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{product.vendor.business_name}</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="flex items-center gap-1">
                                            <span className="text-amber-500">★</span>
                                            {product.vendor.rating_average.toFixed(1)}
                                        </span>
                                        <span className="text-muted-foreground">
                                            ({product.vendor.rating_count} reviews)
                                        </span>
                                        {product.vendor.is_verified && (
                                            <span className="text-success text-xs">✓ Verified</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-primary/10 rounded-lg p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <span>🚚</span> Delivery Information
                            </h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Standard delivery: 2-3 business days</li>
                                <li>• Cash on Delivery available</li>
                                <li>• Free delivery on orders over 30 JOD</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
