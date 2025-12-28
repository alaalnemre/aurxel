'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready_for_pickup' | 'assigned' | 'picked_up' | 'delivered' | 'completed' | 'cancelled';
type DeliveryStatus = 'available' | 'assigned' | 'picked_up' | 'delivered';
type SellerStatus = 'pending' | 'approved' | 'rejected';
type DriverStatus = 'pending' | 'approved' | 'rejected';
type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'rejected';

interface StatusBadgeProps {
    status: OrderStatus | DeliveryStatus | SellerStatus | DriverStatus | DisputeStatus | string;
    type?: 'order' | 'delivery' | 'seller' | 'driver' | 'dispute';
    size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
    // Success states
    delivered: 'bg-success-soft text-success',
    completed: 'bg-success-soft text-success',
    approved: 'bg-success-soft text-success',
    resolved: 'bg-success-soft text-success',
    // Warning states
    pending: 'bg-warning-soft text-warning',
    preparing: 'bg-warning-soft text-warning',
    investigating: 'bg-warning-soft text-warning',
    // Info/Primary states
    placed: 'bg-primary-soft text-primary',
    accepted: 'bg-primary-soft text-primary',
    ready_for_pickup: 'bg-primary-soft text-primary',
    assigned: 'bg-info-soft text-info',
    picked_up: 'bg-info-soft text-info',
    available: 'bg-primary-soft text-primary',
    open: 'bg-primary-soft text-primary',
    // Error states
    cancelled: 'bg-error-soft text-error',
    rejected: 'bg-error-soft text-error',
};

export function StatusBadge({ status, type = 'order', size = 'md' }: StatusBadgeProps) {
    const t = useTranslations();

    const statusKeyMap: Record<string, string> = {
        order: `orders.statuses.${status}`,
        delivery: `driver.statuses.${status}`,
        seller: `admin.sellerStatuses.${status}`,
        driver: `admin.driverStatuses.${status}`,
        dispute: `admin.disputeStatuses.${status}`,
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    const style = statusStyles[status] || 'bg-gray-100 text-gray-600';

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${style} ${sizeStyles[size]}`}>
            {t(statusKeyMap[type])}
        </span>
    );
}

interface EmptyStateProps {
    icon?: React.ReactNode;
    iconType?: 'orders' | 'products' | 'earnings' | 'reviews' | 'deliveries' | 'addresses' | 'favorites' | 'transactions' | 'users' | 'disputes';
    title: string;
    description?: string;
    action?: React.ReactNode;
}

// Predefined icons for common empty states
const emptyStateIcons: Record<string, React.ReactNode> = {
    orders: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    ),
    products: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    earnings: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    reviews: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    ),
    deliveries: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
    ),
    addresses: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    favorites: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    transactions: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    users: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    disputes: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export function EmptyState({ icon, iconType, title, description, action }: EmptyStateProps) {
    const displayIcon = icon || (iconType && emptyStateIcons[iconType]);

    return (
        <div className="text-center py-16 px-4">
            {displayIcon && (
                <div className="mx-auto w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center mb-6 text-primary">
                    {displayIcon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-dark mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    backLink?: string;
    backLabel?: string;
}

export function PageHeader({ title, description, action, backLink, backLabel }: PageHeaderProps) {
    return (
        <div className="mb-8">
            {backLink && (
                <Link
                    href={backLink}
                    className="inline-flex items-center text-primary hover:text-primary-hover mb-4 text-sm font-medium transition-colors"
                >
                    <svg className="w-4 h-4 me-1.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {backLabel || 'Back'}
                </Link>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-dark">{title}</h1>
                    {description && (
                        <p className="mt-1 text-gray-500">{description}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-card border border-border hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-dark">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 font-medium ${trend.isPositive ? 'text-success' : 'text-error'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="w-12 h-12 bg-primary-soft rounded-xl flex items-center justify-center text-primary">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
