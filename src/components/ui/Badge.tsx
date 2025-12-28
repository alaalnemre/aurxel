import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
    const variants: Record<BadgeVariant, string> = {
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        neutral: "bg-gray-100 text-gray-800",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

// Order status badge
export function OrderStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
        placed: { variant: "info", label: "Placed" },
        accepted: { variant: "info", label: "Accepted" },
        preparing: { variant: "warning", label: "Preparing" },
        ready_for_pickup: { variant: "success", label: "Ready" },
        completed: { variant: "success", label: "Completed" },
        cancelled: { variant: "error", label: "Cancelled" },
    };

    const config = statusConfig[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Delivery status badge
export function DeliveryStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
        available: { variant: "info", label: "Available" },
        assigned: { variant: "warning", label: "Assigned" },
        picked_up: { variant: "warning", label: "Picked Up" },
        delivered: { variant: "success", label: "Delivered" },
    };

    const config = statusConfig[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Verification status badge
export function VerificationBadge({ status }: { status: string | null }) {
    const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
        pending: { variant: "warning", label: "Pending" },
        approved: { variant: "success", label: "Verified" },
        rejected: { variant: "error", label: "Rejected" },
    };

    const config = statusConfig[status || ""] || { variant: "neutral", label: "Unknown" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
