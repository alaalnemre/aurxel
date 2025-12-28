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
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-16 px-4">
            {icon && (
                <div className="mx-auto w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center mb-6 text-primary">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-dark mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">{description}</p>
            )}
            {action && <div>{action}</div>}
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
