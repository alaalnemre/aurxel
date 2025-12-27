import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'interactive';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
        const paddingClasses = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        return (
            <div
                ref={ref}
                className={clsx(
                    'card',
                    variant === 'glass' && 'card-glass',
                    variant === 'interactive' && 'card-hover cursor-pointer',
                    paddingClasses[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ title, description, action, className, ...props }, ref) => {
        return (
            <div ref={ref} className={clsx('card-header', className)} {...props}>
                <div>
                    <h3 className="card-title">{title}</h3>
                    {description && (
                        <p className="text-sm text-text-muted mt-1">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
        );
    }
);

CardHeader.displayName = 'CardHeader';

export interface StatCardProps {
    icon?: ReactNode;
    value: string | number;
    label: string;
    change?: {
        value: string;
        trend: 'up' | 'down' | 'neutral';
    };
    className?: string;
}

export const StatCard = ({ icon, value, label, change, className }: StatCardProps) => {
    return (
        <div className={clsx('stat-card', className)}>
            {icon && (
                <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center mb-3 text-accent">
                    {icon}
                </div>
            )}
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {change && (
                <div className={clsx(
                    'stat-change',
                    change.trend === 'up' && 'stat-change-up',
                    change.trend === 'down' && 'stat-change-down'
                )}>
                    {change.trend === 'up' && '↑'}
                    {change.trend === 'down' && '↓'}
                    {change.value}
                </div>
            )}
        </div>
    );
};

export default Card;
