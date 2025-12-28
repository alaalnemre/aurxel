export function Loading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizes[size]} border-gray-200 border-t-primary-600 rounded-full animate-spin`}
            />
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <Loading size="lg" />
                <p className="mt-4 text-gray-500">Loading...</p>
            </div>
        </div>
    );
}

export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8">
                <Loading size="lg" />
            </div>
        </div>
    );
}
