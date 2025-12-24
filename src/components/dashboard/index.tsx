'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type LucideIcon } from 'lucide-react';

// ============================================
// KPI Card Component
// ============================================

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    isLoading?: boolean;
    variant?: 'default' | 'primary' | 'warning' | 'success';
}

export function KPICard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
    isLoading = false,
    variant = 'default',
}: KPICardProps) {
    const variantStyles = {
        default: '',
        primary: 'bg-primary text-primary-foreground',
        warning: 'border-yellow-500 bg-yellow-500/10',
        success: 'border-green-500 bg-green-500/10',
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(variantStyles[variant], className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
                {trend && (
                    <p className={cn(
                        "text-xs mt-1",
                        trend.isPositive ? "text-green-600" : "text-red-600"
                    )}>
                        {trend.isPositive ? '+' : ''}{trend.value}% from last period
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ============================================
// Page Header Component
// ============================================

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-4">{description}</p>
                {action}
            </CardContent>
        </Card>
    );
}

// ============================================
// Data Table Skeleton
// ============================================

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
    return (
        <div className="space-y-3">
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-10 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ============================================
// Error State Component
// ============================================

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'An error occurred while loading data. Please try again.',
    onRetry,
}: ErrorStateProps) {
    return (
        <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-destructive/10 p-4 mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-destructive">{title}</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-4">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-sm text-primary hover:underline"
                    >
                        Try again
                    </button>
                )}
            </CardContent>
        </Card>
    );
}

// ============================================
// Section Container
// ============================================

interface SectionProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}

export function Section({ title, description, action, children }: SectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

// ============================================
// Stats Grid
// ============================================

interface StatsGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4 | 6;
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
    const colClass = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
        6: 'md:grid-cols-3 lg:grid-cols-6',
    };

    return (
        <div className={cn('grid gap-4', colClass[columns])}>
            {children}
        </div>
    );
}
