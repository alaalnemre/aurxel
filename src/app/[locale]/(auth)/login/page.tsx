// src/app/[locale]/(auth)/login/page.tsx
// Login page with functional form

import { setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/components/auth';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <LoginForm />;
}
