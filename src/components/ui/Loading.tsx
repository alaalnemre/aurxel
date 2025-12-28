export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
    const sizes = {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-10 h-10 border-3",
    };

    return (
        <span className={`inline-block ${sizes[size]} border-gray-200 border-t-[#0F766E] rounded-full animate-spin ${className}`} />
    );
}

export function LoadingPage() {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <LoadingSkeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-4 w-1/2" />
                <LoadingSkeleton className="h-6 w-1/3" />
            </div>
        </div>
    );
}
