"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerUser } from "@/actions/auth";
import { Button, Input, Card } from "@/components/ui";

export default function RegisterPage() {
    const t = useTranslations("auth");
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError(t("passwordMismatch"));
            return;
        }

        if (password.length < 6) {
            setError(t("passwordTooShort"));
            return;
        }

        setLoading(true);

        try {
            const result = await registerUser(email, password, fullName, phone || undefined);
            if (result.success && result.redirectTo) {
                router.push(result.redirectTo);
            } else {
                setError(result.error || "Registration failed");
            }
        } catch {
            setError("Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("welcome")}</h1>
                    <p className="text-gray-600">{t("register")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <Input
                        id="fullName"
                        type="text"
                        label={t("fullName")}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />

                    <Input
                        id="email"
                        type="email"
                        label={t("email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        id="phone"
                        type="tel"
                        label={t("phone")}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <Input
                        id="password"
                        type="password"
                        label={t("password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        id="confirmPassword"
                        type="password"
                        label={t("confirmPassword")}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" className="w-full" loading={loading}>
                        {t("register")}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {t("hasAccount")}{" "}
                    <Link href="/login" className="text-[#0F766E] font-medium hover:underline">
                        {t("login")}
                    </Link>
                </div>
            </Card>
        </div>
    );
}
