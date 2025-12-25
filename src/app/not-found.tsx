import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <div className="text-8xl font-bold text-indigo-600 mb-4">404</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Page not found
                </h1>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                    It might have been moved or deleted.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go home
                    </Link>
                    <Link
                        href="/products"
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Browse products
                    </Link>
                </div>
            </div>
        </div>
    );
}
