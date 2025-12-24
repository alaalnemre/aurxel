import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { driverNavItems } from '@/components/layout/sidebar';

interface DriverLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function DriverLayout({ children, params }: DriverLayoutProps) {
    const { locale } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    // Check if user is an approved driver
    const { data: driver } = await supabase
        .from('drivers')
        .select('status')
        .eq('user_id', user.id)
        .single();

    if (!driver) {
        redirect(`/${locale}/onboarding?role=driver`);
    }

    if (driver.status === 'pending') {
        redirect(`/${locale}/onboarding?role=driver`);
    }

    if (driver.status === 'rejected') {
        redirect(`/${locale}/onboarding?role=driver`);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    // Get notification count
    const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

    return (
        <DashboardLayout
            locale={locale}
            navItems={driverNavItems(locale)}
            user={{
                name: profile?.full_name || user.email?.split('@')[0] || 'Driver',
                email: user.email || '',
            }}
            notificationCount={notificationCount || 0}
        >
            {children}
        </DashboardLayout>
    );
}
