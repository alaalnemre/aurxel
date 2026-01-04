export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                {/* Spinner */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>

                {/* Loading Text */}
                <p className="text-lg font-semibold text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}
