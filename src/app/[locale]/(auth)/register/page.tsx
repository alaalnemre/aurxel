// src/app/[locale]/(auth)/register/page.tsx
// Registration page with functional form

import { setRequestLocale } from 'next-intl/server';
import { RegisterForm } from '@/components/auth';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <RegisterForm />;
}
