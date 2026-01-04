import { createClient } from '@/lib/supabase/server';

export default async function ProductsPage() {
    const supabase = await createClient();

    // Fetch all products with vendor info
    const { data: products } = await supabase
        .from('products')
        .select(`
      *,
      vendor:vendors (
        business_name,
        category
      )
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold">Product Moderation</h2>
                <p className="text-muted-foreground mt-1">
                    Review and manage all products on the platform
                </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products && products.length > 0 ? (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
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
                            <div className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {product.description || 'No description'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-primary">
                                        {product.price.toFixed(2)} JOD
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        Stock: {product.stock_quantity}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full capitalize">
                                        {product.category}
                                    </span>
                                    {product.is_active ? (
                                        <span className="px-2 py-1 bg-success/20 text-success rounded-full">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-error/20 text-error rounded-full">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                        Vendor: <span className="font-medium text-foreground">{product.vendor?.business_name}</span>
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition-colors">
                                        View Details
                                    </button>
                                    {!product.is_active && (
                                        <button className="flex-1 px-3 py-2 bg-success text-white text-sm rounded-lg hover:bg-success/90 transition-colors">
                                            Activate
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No products found
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold mt-1">{products?.length || 0}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        {products?.filter((p) => p.is_active).length || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold mt-1 text-error">
                        {products?.filter((p) => !p.is_active).length || 0}
                    </p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        {products?.filter((p) => p.stock_quantity <= p.low_stock_threshold).length || 0}
                    </p>
                </div>
            </div>
        </div>
    );
}
