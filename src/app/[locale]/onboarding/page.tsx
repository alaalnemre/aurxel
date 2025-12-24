import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingContent } from './onboarding-content';

interface OnboardingPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ role?: string }>;
}

export default async function OnboardingPage({ params, searchParams }: OnboardingPageProps) {
    const { locale } = await params;
    const { role: queryRole } = await searchParams;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    // Check current role and status
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // If already a seller, check seller status
    if (profile?.role === 'seller' || queryRole === 'seller') {
        const { data: seller } = await supabase
            .from('sellers')
            .select('status')
            .eq('user_id', user.id)
            .single();

        // If approved seller, redirect to seller dashboard
        if (seller?.status === 'approved') {
            redirect(`/${locale}/seller`);
        }

        return (
            <OnboardingContent
                locale={locale}
                role="seller"
                currentStatus={seller?.status}
            />
        );
    }

    // If already a driver, check driver status  
    if (profile?.role === 'driver' || queryRole === 'driver') {
        const { data: driver } = await supabase
            .from('drivers')
            .select('status')
            .eq('user_id', user.id)
            .single();

        // If approved driver, redirect to driver dashboard
        if (driver?.status === 'approved') {
            redirect(`/${locale}/driver`);
        }

        return (
            <OnboardingContent
                locale={locale}
                role="driver"
                currentStatus={driver?.status}
            />
        );
    }

    // Default to seller application if no role specified
    return (
        <OnboardingContent
            locale={locale}
            role={queryRole === 'driver' ? 'driver' : 'seller'}
        />
    );
}
