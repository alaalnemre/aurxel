import { loginUser } from '@/lib/actions/auth';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function LoginPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('auth');

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                        Welcome Back! 👋
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in to your MarketHub account
                    </p>
                </div>

                {/* Login Form */}
                <form action={loginUser} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="your@email.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter your password"
                        />
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-primary hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Sign In
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-sm text-muted-foreground">OR</span>
                    <div className="flex-1 border-t border-border"></div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link
                            href={`/${locale}/register`}
                            className="text-primary font-semibold hover:underline"
                        >
                            Create Account
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href={`/${locale}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
