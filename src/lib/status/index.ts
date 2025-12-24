// ============================================
// Status Transition Validators - Single Source of Truth
// Pure functions for validating status transitions
// ============================================

import type { OrderStatus, DeliveryStatus } from '@/types';

// Order Status Flow: pending_seller -> preparing -> ready_for_pickup -> completed
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending_seller: ['preparing'],
    preparing: ['ready_for_pickup'],
    ready_for_pickup: ['completed'],
    completed: [], // Terminal state
};

// Delivery Status Flow: available -> assigned -> picked_up -> delivered
const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
    available: ['assigned'],
    assigned: ['picked_up'],
    picked_up: ['delivered'],
    delivered: [], // Terminal state
};

/**
 * Check if an order status transition is valid
 */
export function isValidOrderTransition(
    current: OrderStatus,
    next: OrderStatus
): boolean {
    return ORDER_TRANSITIONS[current]?.includes(next) ?? false;
}

/**
 * Check if a delivery status transition is valid
 */
export function isValidDeliveryTransition(
    current: DeliveryStatus,
    next: DeliveryStatus
): boolean {
    return DELIVERY_TRANSITIONS[current]?.includes(next) ?? false;
}

/**
 * Get allowed next statuses for an order
 */
export function getNextOrderStatuses(current: OrderStatus): OrderStatus[] {
    return ORDER_TRANSITIONS[current] ?? [];
}

/**
 * Get allowed next statuses for a delivery
 */
export function getNextDeliveryStatuses(current: DeliveryStatus): DeliveryStatus[] {
    return DELIVERY_TRANSITIONS[current] ?? [];
}

/**
 * Check if order is in a terminal state
 */
export function isOrderComplete(status: OrderStatus): boolean {
    return status === 'completed';
}

/**
 * Check if delivery is in a terminal state
 */
export function isDeliveryComplete(status: DeliveryStatus): boolean {
    return status === 'delivered';
}

// Export constants for UI usage
export const ORDER_STATUS_LABELS: Record<OrderStatus, { en: string; ar: string }> = {
    pending_seller: { en: 'Pending', ar: 'قيد الانتظار' },
    preparing: { en: 'Preparing', ar: 'قيد التحضير' },
    ready_for_pickup: { en: 'Ready for Pickup', ar: 'جاهز للاستلام' },
    completed: { en: 'Completed', ar: 'مكتمل' },
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, { en: string; ar: string }> = {
    available: { en: 'Available', ar: 'متاح' },
    assigned: { en: 'Assigned', ar: 'تم التعيين' },
    picked_up: { en: 'Picked Up', ar: 'تم الاستلام' },
    delivered: { en: 'Delivered', ar: 'تم التوصيل' },
};
