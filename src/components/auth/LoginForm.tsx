// src/components/auth/LoginForm.tsx
// Minimal client component for login form

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { loginUser } from '@/actions';

export function LoginForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        startTransition(async () => {
            const result = await loginUser(email, password);

            if (!result.success) {
                setError(result.error || 'Login failed');
                return;
            }

            // Redirect based on capabilities
            if (result.redirectTo) {
                router.push(result.redirectTo);
                router.refresh();
            }
        });
    }

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    Sign In
                </h1>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="email@example.com"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            disabled={isPending}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Sign Up Link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/register"
                        className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
