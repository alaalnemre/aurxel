import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { deleteProduct } from '@/lib/actions/vendor';
import Link from 'next/link';

export default async function ProductsPage() {
    const user = await getCurrentUser();
    const supabase = await createClient();

    // Get vendor info
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user!.id)
        .single();

    if (!vendor) {
        return <div>Vendor not found</div>;
    }

    // Get all vendor products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">My Products</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your product catalog
                    </p>
                </div>
                <Link
                    href="./products/new"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                    ➕ Add New Product
                </Link>
            </div>

            {/* Products Grid */}
            {products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Product Image */}
                            <div className="aspect-square bg-muted flex items-center justify-center relative">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-6xl">📦</span>
                                )}
                                {!product.is_active && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="px-3 py-1 bg-error text-white rounded-full text-sm font-semibold">
                                            Inactive
                                        </span>
                                    </div>
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
                                    <span className={`text-sm ${product.stock_quantity <= product.low_stock_threshold
                                        ? 'text-error font-semibold'
                                        : 'text-muted-foreground'
                                        }`}>
                                        Stock: {product.stock_quantity}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 bg-primary/20 text-primary rounded-full capitalize">
                                        {product.category}
                                    </span>
                                    {product.stock_quantity <= product.low_stock_threshold && (
                                        <span className="px-2 py-1 bg-error/20 text-error rounded-full">
                                            Low Stock
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Link
                                        href={`./products/${product.id}/edit`}
                                        className="flex-1 px-3 py-2 bg-primary text-white text-sm text-center rounded-lg hover:bg-primary-hover transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <form action={deleteProduct} className="flex-1">
                                        <input type="hidden" name="productId" value={product.id} />
                                        <button
                                            type="submit"
                                            className="w-full px-3 py-2 bg-error text-white text-sm rounded-lg hover:bg-error/90 transition-colors"
                                            onClick={(e) => {
                                                if (!confirm('Are you sure you want to delete this product?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-background border border-border rounded-xl">
                    <p className="text-6xl mb-4">📦</p>
                    <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Start building your catalog by adding your first product
                    </p>
                    <Link
                        href="./products/new"
                        className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Add Your First Product
                    </Link>
                </div>
            )}

            {/* Summary Stats */}
            {products && products.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-2xl font-bold mt-1">{products.length}</p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Active</p>
                        <p className="text-2xl font-bold mt-1 text-success">
                            {products.filter((p) => p.is_active).length}
                        </p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Low Stock</p>
                        <p className="text-2xl font-bold mt-1 text-warning">
                            {products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length}
                        </p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold mt-1 text-primary">
                            {products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0).toFixed(2)} JOD
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
