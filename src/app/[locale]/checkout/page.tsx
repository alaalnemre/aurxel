export default async function CheckoutPage() {
    // Mock cart summary
    const mockTotal = 55.50;
    const mockDeliveryFee = 0;

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Checkout</h1>
                    <p className="text-muted-foreground mt-1">
                        Complete your order
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="+962 7X XXX XXXX"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            City *
                                        </label>
                                        <select className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                                            <option value="">Select City</option>
                                            <option value="amman">Amman</option>
                                            <option value="zarqa">Zarqa</option>
                                            <option value="irbid">Irbid</option>
                                            <option value="aqaba">Aqaba</option>
                                            <option value="madaba">Madaba</option>
                                            <option value="petra">Petra</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Area *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="e.g., Abdoun, Jabal Amman"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Street name and number"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Building
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Bldg #"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Floor
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Floor #"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Apartment
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Apt #"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Delivery Instructions
                                    </label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Any special instructions for the driver..."
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-lg cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        defaultChecked
                                        className="w-4 h-4 text-primary"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">💵</span>
                                            <span className="font-semibold">Cash on Delivery</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Pay when you receive your order
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-not-allowed opacity-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        disabled
                                        className="w-4 h-4"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">💳</span>
                                            <span className="font-semibold">Online Payment</span>
                                            <span className="text-xs bg-muted px-2 py-1 rounded">
                                                Coming Soon
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Credit/Debit card payment
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Any special requests or notes for your order..."
                            />
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-xl p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">
                                        {mockTotal.toFixed(2)} JOD
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-semibold text-success">
                                        FREE
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="font-semibold">0.00 JOD</span>
                                </div>

                                <div className="border-t border-border pt-3 mt-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold">Total</span>
                                        <span className="font-bold text-primary">
                                            {mockTotal.toFixed(2)} JOD
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg mb-3">
                                Place Order
                            </button>

                            <a
                                href="./cart"
                                className="block w-full py-3 border border-border text-center font-semibold rounded-lg hover:bg-muted transition-colors"
                            >
                                ← Back to Cart
                            </a>

                            {/* Security Note */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="text-lg">🔒</span>
                                    <p>
                                        Your order information is secure and will only be used to process your delivery.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
