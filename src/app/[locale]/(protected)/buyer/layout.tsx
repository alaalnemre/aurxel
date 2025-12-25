import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { buyerNavItems } from '@/components/layout/sidebar';

interface BuyerLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function BuyerLayout({ children, params }: BuyerLayoutProps) {
    const { locale } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle();

    // Get notification count
    const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

    return (
        <DashboardLayout
            locale={locale}
            navItems={buyerNavItems(locale)}
            user={{
                name: profile?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
            }}
            notificationCount={notificationCount || 0}
        >
            {children}
        </DashboardLayout>
    );
}
