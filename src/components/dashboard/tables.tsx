'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

// ============================================
// Data Table Component
// ============================================

export interface Column<T> {
    key: string;
    title: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    isLoading?: boolean;
    emptyState?: {
        icon: LucideIcon;
        title: string;
        description: string;
        action?: React.ReactNode;
    };
    onRowClick?: (item: T) => void;
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    isLoading = false,
    emptyState,
    onRowClick,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col.key} className={col.className}>
                                        {col.title}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0 && emptyState) {
        const Icon = emptyState.icon;
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{emptyState.title}</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-4">
                        {emptyState.description}
                    </p>
                    {emptyState.action}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key} className={col.className}>
                                    {col.title}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow
                                key={keyExtractor(item)}
                                className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((col) => (
                                    <TableCell key={col.key} className={col.className}>
                                        {col.render
                                            ? col.render(item)
                                            : (item as Record<string, unknown>)[col.key]?.toString() || '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ============================================
// Status Badge Component
// ============================================

type StatusVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    label?: string;
}

const statusVariants: Record<string, StatusVariant> = {
    // Order statuses
    pending_seller: 'warning',
    preparing: 'secondary',
    ready_for_pickup: 'default',
    completed: 'success',
    // Delivery statuses
    available: 'outline',
    assigned: 'secondary',
    picked_up: 'default',
    delivered: 'success',
    // KYC statuses
    pending: 'warning',
    approved: 'success',
    rejected: 'destructive',
    // Generic
    active: 'success',
    inactive: 'secondary',
};

export function StatusBadge({ status, variant, label }: StatusBadgeProps) {
    const resolvedVariant = variant || statusVariants[status] || 'default';

    // Custom class for success/warning since Badge doesn't have these by default
    const customClass = {
        success: 'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-100',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-100',
    };

    const badgeVariant = resolvedVariant === 'success' || resolvedVariant === 'warning'
        ? 'outline'
        : resolvedVariant;

    return (
        <Badge
            variant={badgeVariant as 'default' | 'secondary' | 'destructive' | 'outline'}
            className={cn(
                resolvedVariant === 'success' && customClass.success,
                resolvedVariant === 'warning' && customClass.warning
            )}
        >
            {label || status.replace(/_/g, ' ')}
        </Badge>
    );
}

// ============================================
// Pagination Component
// ============================================

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

// ============================================
// Activity Item Component
// ============================================

interface ActivityItemProps {
    icon: LucideIcon;
    title: string;
    description: string;
    timestamp: string;
    status?: React.ReactNode;
}

export function ActivityItem({ icon: Icon, title, description, timestamp, status }: ActivityItemProps) {
    return (
        <div className="flex items-start gap-4 py-3 border-b last:border-0">
            <div className="rounded-full bg-muted p-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{title}</p>
                    {status}
                </div>
                <p className="text-sm text-muted-foreground truncate">{description}</p>
                <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
            </div>
        </div>
    );
}

// ============================================
// Quick Action Card
// ============================================

interface QuickActionProps {
    icon: LucideIcon;
    title: string;
    description: string;
    onClick?: () => void;
    href?: string;
    variant?: 'default' | 'primary';
}

export function QuickAction({ icon: Icon, title, description, onClick, variant = 'default' }: QuickActionProps) {
    return (
        <Card
            className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={onClick}
        >
            <CardContent className="flex items-center gap-4 py-4">
                <div className={cn(
                    "rounded-full p-2",
                    variant === 'primary' ? "bg-primary-foreground/20" : "bg-muted"
                )}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-medium">{title}</p>
                    <p className={cn(
                        "text-sm",
                        variant === 'primary' ? "opacity-90" : "text-muted-foreground"
                    )}>{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
