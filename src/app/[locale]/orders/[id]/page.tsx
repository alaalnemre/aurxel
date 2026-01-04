import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { redirect, notFound } from 'next/navigation';

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    const { id, locale } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Get order with all related data
    const { data: order } = await supabase
        .from('orders')
        .select(`
      *,
      vendor:vendors (
        business_name,
        business_phone,
        business_address
      ),
      delivery_address:addresses!delivery_address_id (
        full_name,
        phone,
        address_line1,
        city,
        area
      ),
      items:order_items (
        *
      )
    `)
        .eq('id', id)
        .eq('customer_id', user.id)
        .maybeSingle();

    if (!order) {
        notFound();
    }

    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: '📝' },
        { key: 'confirmed', label: 'Confirmed', icon: '✅' },
        { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
        { key: 'ready', label: 'Ready for Pickup', icon: '📦' },
        { key: 'picked_up', label: 'Picked Up', icon: '🚚' },
        { key: 'in_transit', label: 'In Transit', icon: '🛣️' },
        { key: 'delivered', label: 'Delivered', icon: '✨' },
    ];

    const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <a
                    href="../orders"
                    className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
                >
                    ← Back to Orders
                </a>

                {/* Order Header */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                Order {order.order_number}
                            </h1>
                            <p className="text-muted-foreground">
                                Placed on {new Date(order.created_at).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Total</p>
                            <p className="text-3xl font-bold text-primary">
                                {order.total.toFixed(2)} JOD
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Status Timeline */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-6">Order Status</h2>

                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted"></div>
                        <div
                            className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
                            style={{
                                height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                            }}
                        ></div>

                        {/* Status Steps */}
                        <div className="relative space-y-8">
                            {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.key} className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl z-10 transition-all ${isCompleted
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'bg-muted text-muted-foreground'
                                                } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                                        >
                                            {step.icon}
                                        </div>

                                        {/* Label */}
                                        <div className="flex-1 pt-2">
                                            <p
                                                className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <p className="text-sm text-primary font-medium mt-1">
                                                    Current Status
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {order.status === 'cancelled' && (
                        <div className="mt-6 p-4 bg-error/10 border border-error rounded-lg">
                            <p className="font-semibold text-error">Order Cancelled</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                This order was cancelled
                            </p>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items?.map((item: any) => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                    {item.product_image_url ? (
                                        <img
                                            src={item.product_image_url}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <span className="text-3xl">📦</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.product_name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Quantity: {item.quantity}
                                    </p>
                                    <p className="text-primary font-semibold mt-1">
                                        {item.unit_price.toFixed(2)} JOD × {item.quantity} ={' '}
                                        {item.subtotal.toFixed(2)} JOD
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-6 border-t border-border space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold">{order.subtotal.toFixed(2)} JOD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery Fee</span>
                            <span className="font-semibold">{order.delivery_fee.toFixed(2)} JOD</span>
                        </div>
                        {order.tax > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-semibold">{order.tax.toFixed(2)} JOD</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg pt-2 border-t border-border">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-primary">
                                {order.total.toFixed(2)} JOD
                            </span>
                        </div>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">{order.delivery_address?.full_name}</p>
                            <p className="text-muted-foreground">{order.delivery_address?.phone}</p>
                            <p className="text-muted-foreground">
                                {order.delivery_address?.address_line1}
                            </p>
                            <p className="text-muted-foreground">
                                {order.delivery_address?.area}, {order.delivery_address?.city}
                            </p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Vendor Information</h2>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">{order.vendor?.business_name}</p>
                            <p className="text-muted-foreground">{order.vendor?.business_phone}</p>
                            <p className="text-muted-foreground">{order.vendor?.business_address}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {order.status === 'delivered' && (
                    <div className="mt-6 flex gap-4">
                        <button className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors">
                            Reorder
                        </button>
                        <button className="flex-1 px-6 py-3 border border-border font-semibold rounded-lg hover:bg-muted transition-colors">
                            Leave Review
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
