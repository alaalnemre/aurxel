"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginUser } from "@/actions/auth";
import { Button, Input, Card } from "@/components/ui";

export default function LoginPage() {
    const t = useTranslations("auth");
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginUser(email, password);
            if (result.success && result.redirectTo) {
                router.push(result.redirectTo);
            } else {
                setError(result.error || t("invalidCredentials"));
            }
        } catch {
            setError(t("invalidCredentials"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("welcomeBack")}</h1>
                    <p className="text-gray-600">{t("login")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Input
                        id="email"
                        type="email"
                        label={t("email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                    />

                    <Input
                        id="password"
                        type="password"
                        label={t("password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <Button type="submit" className="w-full" loading={loading}>
                        {t("login")}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {t("noAccount")}{" "}
                    <Link href="/register" className="text-[#0F766E] font-medium hover:underline">
                        {t("register")}
                    </Link>
                </div>
            </Card>
        </div>
    );
}
