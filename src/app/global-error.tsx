'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console (in production, send to monitoring service)
        console.error('[GlobalError]', error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-8">
                            We apologize for the inconvenience. An unexpected error occurred.
                            Please try again or contact support if the problem persists.
                        </p>
                        {error.digest && (
                            <p className="text-sm text-gray-400 mb-6">
                                Error ID: {error.digest}
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={reset}
                                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Try again
                            </button>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Go home
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
