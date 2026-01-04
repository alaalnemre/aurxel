'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Error Boundary]', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border-2 border-error rounded-xl p-8 text-center">
                {/* Error Icon */}
                <div className="text-6xl mb-4">⚠️</div>

                {/* Error Title */}
                <h2 className="text-2xl font-bold text-error mb-2">
                    Something went wrong!
                </h2>

                {/* Error Message */}
                <p className="text-muted-foreground mb-6">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>

                {/* Error Digest (for debugging) */}
                {error.digest && (
                    <p className="text-xs text-muted-foreground mb-6 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={reset}
                        className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex-1 px-4 py-2 border border-border font-semibold rounded-lg hover:bg-muted transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
}
