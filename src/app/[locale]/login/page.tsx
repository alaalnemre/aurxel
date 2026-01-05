import { loginUser } from '@/lib/actions/auth';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function LoginPage({
    params,
}: {
    params: { locale: string };
}) {
    const { locale } = params;
    const tAuth = await getTranslations('auth');
    const tHome = await getTranslations('homepage');
    const tCommon = await getTranslations('common');

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                        {tHome('welcomeBack')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {tHome('signInToAccount')}
                    </p>
                </div>

                {/* Login Form */}
                <form action={loginUser} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {tHome('emailAddress')} *
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
                            {tCommon('password')} *
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={tHome('enterPassword')}
                        />
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm">{tHome('rememberMe')}</span>
                        </label>
                        <a href="#" className="text-sm text-primary hover:underline">
                            {tHome('forgotPassword')}
                        </a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        {tHome('signIn')}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-sm text-muted-foreground">{tHome('or')}</span>
                    <div className="flex-1 border-t border-border"></div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        {tAuth('dontHaveAccount')}{' '}
                        <Link
                            href={`/${locale}/register`}
                            className="text-primary font-semibold hover:underline"
                        >
                            {tHome('createAccount')}
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href={`/${locale}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                    >
                        {tHome('backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
