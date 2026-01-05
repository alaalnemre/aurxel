export const dynamic = 'force-dynamic';
import { getTranslations } from 'next-intl/server';

export default async function CartPage() {
    // In a real app, cart data would come from a state management solution
    // or database. For now, this is a UI demonstration.

    const mockCartItems = [
        {
            id: '1',
            product_name: 'Premium Wireless Headphones',
            vendor_name: 'Tech Store Jordan',
            price: 45.00,
            quantity: 1,
            image_url: null,
            stock: 10,
        },
        {
            id: '2',
            product_name: 'Organic Olive Oil 500ml',
            vendor_name: 'Fresh Grocery',
            price: 8.50,
            quantity: 2,
            image_url: null,
            stock: 25,
        },
    ];

    const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 30 ? 0 : 2.00;
    const total = subtotal + deliveryFee;

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    <p className="text-muted-foreground mt-1">
                        {mockCartItems.length} items in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {mockCartItems.length > 0 ? (
                            mockCartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-card border border-border rounded-xl p-4"
                                >
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-4xl">📦</span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">
                                                {item.product_name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Sold by: {item.vendor_name}
                                            </p>
                                            <p className="text-lg font-bold text-primary">
                                                {item.price.toFixed(2)} JOD
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center border border-border rounded-lg">
                                                <button className="px-3 py-1 hover:bg-muted transition-colors">
                                                    −
                                                </button>
                                                <span className="px-4 py-1 border-x border-border">
                                                    {item.quantity}
                                                </span>
                                                <button className="px-3 py-1 hover:bg-muted transition-colors">
                                                    +
                                                </button>
                                            </div>
                                            <button className="text-sm text-error hover:underline">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-card border border-border rounded-xl">
                                <p className="text-6xl mb-4">🛒</p>
                                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                                <p className="text-muted-foreground mb-6">
                                    Add some products to get started
                                </p>
                                <a
                                    href="./shop"
                                    className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    Continue Shopping
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">
                                        {subtotal.toFixed(2)} JOD
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-semibold">
                                        {deliveryFee === 0 ? (
                                            <span className="text-success">FREE</span>
                                        ) : (
                                            `${deliveryFee.toFixed(2)} JOD`
                                        )}
                                    </span>
                                </div>

                                {subtotal < 30 && (
                                    <div className="p-3 bg-info/10 border border-info rounded-lg text-sm">
                                        <p className="text-info font-medium">
                                            Add {(30 - subtotal).toFixed(2)} JOD more for free delivery!
                                        </p>
                                    </div>
                                )}

                                <div className="border-t border-border pt-3 mt-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold">Total</span>
                                        <span className="font-bold text-primary">
                                            {total.toFixed(2)} JOD
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="./checkout"
                                className="block w-full py-3 bg-gradient-to-r from-primary to-secondary text-white text-center font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg mb-3"
                            >
                                Proceed to Checkout
                            </a>

                            <a
                                href="./shop"
                                className="block w-full py-3 border border-border text-center font-semibold rounded-lg hover:bg-muted transition-colors"
                            >
                                Continue Shopping
                            </a>

                            {/* Payment Methods */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <p className="text-sm text-muted-foreground mb-2">
                                    We accept:
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-2 bg-muted rounded border border-border text-sm font-medium">
                                        💵 Cash on Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
