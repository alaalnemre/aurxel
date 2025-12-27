import { ReactNode } from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
    variant?: BadgeVariant;
    dot?: boolean;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}

export const Badge = ({
    variant = 'default',
    dot = false,
    icon,
    children,
    className,
}: BadgeProps) => {
    const variantClasses: Record<BadgeVariant, string> = {
        default: 'badge-default',
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
    };

    return (
        <span
            className={clsx(
                'badge',
                variantClasses[variant],
                dot && 'badge-dot',
                className
            )}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
};

// Pre-configured status badges for orders
export type OrderStatus =
    | 'placed'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'assigned'
    | 'picked_up'
    | 'delivered'
    | 'cancelled';

const orderStatusConfig: Record<OrderStatus, { variant: BadgeVariant; labelEn: string; labelAr: string }> = {
    placed: { variant: 'primary', labelEn: 'Placed', labelAr: 'جديد' },
    accepted: { variant: 'primary', labelEn: 'Accepted', labelAr: 'مقبول' },
    preparing: { variant: 'warning', labelEn: 'Preparing', labelAr: 'قيد التحضير' },
    ready: { variant: 'warning', labelEn: 'Ready', labelAr: 'جاهز' },
    assigned: { variant: 'primary', labelEn: 'Assigned', labelAr: 'تم التعيين' },
    picked_up: { variant: 'primary', labelEn: 'In Transit', labelAr: 'في الطريق' },
    delivered: { variant: 'success', labelEn: 'Delivered', labelAr: 'تم التوصيل' },
    cancelled: { variant: 'danger', labelEn: 'Cancelled', labelAr: 'ملغي' },
};

export interface OrderStatusBadgeProps {
    status: OrderStatus;
    locale?: string;
    className?: string;
}

export const OrderStatusBadge = ({ status, locale = 'en', className }: OrderStatusBadgeProps) => {
    const config = orderStatusConfig[status] || orderStatusConfig.placed;
    const label = locale === 'ar' ? config.labelAr : config.labelEn;

    return (
        <Badge variant={config.variant} dot className={className}>
            {label}
        </Badge>
    );
};

// Pre-configured verification badges
export interface VerificationBadgeProps {
    verified: boolean;
    locale?: string;
    className?: string;
}

export const VerificationBadge = ({ verified, locale = 'en', className }: VerificationBadgeProps) => {
    if (verified) {
        return (
            <Badge variant="success" icon="✓" className={className}>
                {locale === 'ar' ? 'موثق' : 'Verified'}
            </Badge>
        );
    }

    return (
        <Badge variant="warning" className={className}>
            {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
        </Badge>
    );
};

export default Badge;
