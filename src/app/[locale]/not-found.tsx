import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found | MarketHub',
    description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                    404
                </div>

                {/* Icon */}
                <div className="text-6xl mb-4">🔍</div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>

                {/* Description */}
                <p className="text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Go Home
                    </a>
                    <a
                        href="/shop"
                        className="px-6 py-3 border border-border font-semibold rounded-lg hover:bg-muted transition-colors"
                    >
                        Browse Products
                    </a>
                </div>
            </div>
        </div>
    );
}
