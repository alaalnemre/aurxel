'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className = '', width, height }: SkeletonProps) {
    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || '1rem',
    };

    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
            style={style}
        />
    );
}

/**
 * Skeleton for StatCard - matches KPI card layout exactly
 */
export function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-6 shadow-card border border-border">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <Skeleton className="mb-2" width="60%" height="0.875rem" />
                    <Skeleton width="80%" height="1.75rem" />
                </div>
                <Skeleton className="rounded-xl flex-shrink-0" width="3rem" height="3rem" />
            </div>
        </div>
    );
}

/**
 * Grid of StatCard skeletons
 */
export function StatCardGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: count }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="flex-1"
                    height="1rem"
                    width={i === 0 ? '40%' : i === columns - 1 ? '20%' : '30%'}
                />
            ))}
        </div>
    );
}

/**
 * Full table skeleton with header and rows
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-border">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="flex-1" height="0.875rem" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns} />
            ))}
        </div>
    );
}

/**
 * Skeleton for chart areas
 */
export function ChartSkeleton({ height = '12rem' }: { height?: string }) {
    return (
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
            <Skeleton className="mb-4" width="40%" height="1.25rem" />
            <div
                className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg animate-pulse"
                style={{ height }}
            >
                {/* Fake chart bars */}
                <div className="flex items-end justify-around h-full p-4 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 rounded-t flex-1"
                            style={{ height: `${30 + Math.random() * 50}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Card skeleton for generic content cards
 */
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-border shadow-card p-6">
            <Skeleton className="mb-4" width="50%" height="1.25rem" />
            <div className="space-y-3">
                <Skeleton height="1rem" />
                <Skeleton width="80%" height="1rem" />
                <Skeleton width="60%" height="1rem" />
            </div>
        </div>
    );
}

/**
 * List item skeleton
 */
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton className="rounded-full flex-shrink-0" width="2.5rem" height="2.5rem" />
            <div className="flex-1 space-y-2">
                <Skeleton width="60%" height="1rem" />
                <Skeleton width="40%" height="0.75rem" />
            </div>
            <Skeleton className="flex-shrink-0" width="4rem" height="1rem" />
        </div>
    );
}

/**
 * List skeleton with multiple items
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
    return (
        <div className="bg-white rounded-xl border border-border shadow-card divide-y divide-border">
            {Array.from({ length: items }).map((_, i) => (
                <ListItemSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Page header skeleton
 */
export function PageHeaderSkeleton() {
    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Skeleton className="mb-2" width="12rem" height="1.75rem" />
                    <Skeleton width="16rem" height="1rem" />
                </div>
                <Skeleton className="rounded-lg" width="8rem" height="2.5rem" />
            </div>
        </div>
    );
}

/**
 * Navigation tabs skeleton
 */
export function NavTabsSkeleton({ tabs = 4 }: { tabs?: number }) {
    return (
        <nav className="mb-8 border-b border-border">
            <div className="flex flex-wrap gap-1 -mb-px">
                {Array.from({ length: tabs }).map((_, i) => (
                    <Skeleton key={i} className="rounded-t" width="5rem" height="2.75rem" />
                ))}
            </div>
        </nav>
    );
}

/**
 * Full dashboard page skeleton layout
 */
export function DashboardSkeleton({ kpiCount = 4, showChart = true, showTable = true }: {
    kpiCount?: number;
    showChart?: boolean;
    showTable?: boolean;
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <NavTabsSkeleton />
                <PageHeaderSkeleton />
                <StatCardGridSkeleton count={kpiCount} />
                {showChart && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <ChartSkeleton />
                        <CardSkeleton />
                    </div>
                )}
                {showTable && <TableSkeleton />}
            </div>
        </div>
    );
}
