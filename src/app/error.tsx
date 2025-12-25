'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Error]', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">😕</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Oops! Something went wrong
                </h1>
                <p className="text-gray-600 mb-6">
                    We encountered an error while loading this page.
                    Please try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
