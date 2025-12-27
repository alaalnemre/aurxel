// src/components/auth/RegisterForm.tsx
// Client component for registration form with server action integration

'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { registerUser } from '@/actions';

export function RegisterForm() {
    const t = useTranslations('auth');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setSuccess(false);

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const fullName = formData.get('fullName') as string;

        // Client-side password confirmation check
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        startTransition(async () => {
            const result = await registerUser(email, password);

            if (!result.success) {
                setError(result.error || 'Registration failed');
                return;
            }

            // Show success message then redirect to buyer dashboard
            setSuccess(true);

            setTimeout(() => {
                router.push('/buyer');
                router.refresh();
            }, 1500);
        });
    }

    if (success) {
        return (
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
                    <div className="text-center">
                        <div className="mb-4 text-5xl">✅</div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                            Registration Successful!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please check your email to confirm your account, or you will be redirected shortly.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    {t('registerTitle')}
                </h1>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-5">
                    {/* Full Name Field */}
                    <div>
                        <label
                            htmlFor="fullName"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            {t('fullName')}
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            required
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            placeholder="Your Name"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            placeholder="email@example.com"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            minLength={8}
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            {t('confirmPassword')}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            minLength={8}
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="terms"
                            name="terms"
                            required
                            disabled={isPending}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                            htmlFor="terms"
                            className="text-sm text-gray-600 dark:text-gray-400"
                        >
                            {t('termsAgree')}
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? '...' : t('registerButton')}
                    </button>
                </form>

                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('hasAccount')}{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                        {t('signInLink')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
