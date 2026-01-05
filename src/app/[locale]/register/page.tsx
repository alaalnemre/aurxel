import { registerUser } from '@/lib/actions/auth';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function RegisterPage({
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
            <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                        {tAuth('joinMarketHub')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {tAuth('startYourJourney')}
                    </p>
                </div>

                {/* Registration Form */}
                <form action={registerUser} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {tAuth('fullName')} *
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={tAuth('fullNamePlaceholder')}
                        />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {tAuth('phoneNumber')}
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={tAuth('phonePlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {tCommon('password')} *
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={tAuth('passwordPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {tCommon('confirmPassword')} *
                            </label>
                            <input
                                type="password"
                                name="confirm_password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder={tAuth('confirmPasswordPlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            {tAuth('joinAs')} *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Customer */}
                            <label className="flex items-start gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                <input
                                    type="radio"
                                    name="role"
                                    value="customer"
                                    defaultChecked
                                    className="mt-1 w-4 h-4 text-primary"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">🛑️</span>
                                        <span className="font-semibold">{tAuth('roleCustomer')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {tAuth('customerDescription')}
                                    </p>
                                </div>
                            </label>

                            {/* Vendor */}
                            <label className="flex items-start gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                <input
                                    type="radio"
                                    name="role"
                                    value="vendor"
                                    className="mt-1 w-4 h-4 text-primary"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">🏪</span>
                                        <span className="font-semibold">{tAuth('roleVendor')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {tAuth('vendorDescription')}
                                    </p>
                                </div>
                            </label>

                            {/* Driver */}
                            <label className="flex items-start gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                <input
                                    type="radio"
                                    name="role"
                                    value="driver"
                                    className="mt-1 w-4 h-4 text-primary"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">🚚</span>
                                        <span className="font-semibold">{tAuth('roleDriver')}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {tAuth('driverDescription')}
                                    </p>
                                </div>
                            </label>

                            {/* Admin (hidden, for special access only) */}
                            <input type="radio" name="role" value="admin" className="hidden" />
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            required
                            className="mt-1 w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                        />
                        <label className="text-sm text-muted-foreground">
                            {tAuth('agreeTerms')}{' '}
                            <a href="#" className="text-primary hover:underline">
                                {tAuth('termsOfService')}
                            </a>{' '}
                            {tAuth('and')}{' '}
                            <a href="#" className="text-primary hover:underline">
                                {tAuth('privacyPolicy')}
                            </a>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-amber-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                        {tHome('createAccount')}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-sm text-muted-foreground">{tHome('or')}</span>
                    <div className="flex-1 border-t border-border"></div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        {tAuth('alreadyHaveAccount')}{' '}
                        <Link
                            href={`/${locale}/login`}
                            className="text-primary font-semibold hover:underline"
                        >
                            {tHome('signIn')}
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
