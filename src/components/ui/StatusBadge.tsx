import { useTranslations } from 'next-intl';

type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready_for_pickup' | 'assigned' | 'picked_up' | 'delivered' | 'completed' | 'cancelled';
type DeliveryStatus = 'available' | 'assigned' | 'picked_up' | 'delivered';

interface StatusBadgeProps {
    status: OrderStatus | DeliveryStatus;
    type?: 'order' | 'delivery';
}

export function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
    const t = useTranslations();

    const statusKey = type === 'order' ? `orders.statuses.${status}` : `driver.statuses.${status}`;

    return (
        <span className={`status-badge status-${status}`}>
            {t(statusKey)}
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
        <div className="text-center py-12">
            {icon && (
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                    <p className="mt-1 text-gray-500">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
