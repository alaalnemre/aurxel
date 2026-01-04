import { createProduct } from '@/lib/actions/vendor';

export default async function NewProductPage() {
    return (
        <div className="max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold">Add New Product</h2>
                <p className="text-muted-foreground mt-1">
                    Fill in the details to list your product
                </p>
            </div>

            {/* Product Form */}
            <form action={createProduct} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter product name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Product Name (Arabic)
                            </label>
                            <input
                                type="text"
                                name="name_ar"
                                dir="rtl"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="اسم المنتج بالعربية"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Product description..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description (Arabic)
                            </label>
                            <textarea
                                name="description_ar"
                                rows={3}
                                dir="rtl"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="وصف المنتج بالعربية..."
                            />
                        </div>
                    </div>
                </div>

                {/* Category */}
                <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Category</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Category *
                            </label>
                            <input
                                type="text"
                                name="category"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., Electronics, Clothing, Food"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Subcategory
                            </label>
                            <input
                                type="text"
                                name="subcategory"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Optional subcategory"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Pricing</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Price (JOD) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                min="0"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Compare at Price (JOD)
                            </label>
                            <input
                                type="number"
                                name="compare_at_price"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Optional original price"
                            />
                        </div>
                    </div>
                </div>

                {/* Inventory */}
                <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Inventory</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Stock Quantity *
                            </label>
                            <input
                                type="number"
                                name="stock_quantity"
                                min="0"
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                SKU (Stock Keeping Unit)
                            </label>
                            <input
                                type="text"
                                name="sku"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Optional product code"
                            />
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Product Image</h3>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Image URL
                        </label>
                        <input
                            type="url"
                            name="image_url"
                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Enter the URL of your product image
                        </p>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-background border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Status</h3>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                value="true"
                                defaultChecked
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm">Active (visible to customers)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_featured"
                                value="true"
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm">Featured product</span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Add Product
                    </button>
                    <a
                        href="../products"
                        className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors text-center"
                    >
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    );
}
