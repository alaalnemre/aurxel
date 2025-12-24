import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { adminNavItems } from '@/components/layout/sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect(`/${locale}/unauthorized`);
    }

    // Get notification count
    const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

    return (
        <DashboardLayout
            locale={locale}
            navItems={adminNavItems(locale)}
            user={{
                name: profile?.full_name || 'Admin',
                email: user.email || '',
            }}
            notificationCount={notificationCount || 0}
        >
            {children}
        </DashboardLayout>
    );
}
