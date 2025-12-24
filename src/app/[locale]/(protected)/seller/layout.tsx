import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { sellerNavItems } from '@/components/layout/sidebar';

interface SellerLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function SellerLayout({ children, params }: SellerLayoutProps) {
    const { locale } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    // Check if user is an approved seller
    const { data: seller } = await supabase
        .from('sellers')
        .select('status, business_name')
        .eq('user_id', user.id)
        .single();

    if (!seller) {
        // Not a seller, redirect to onboarding
        redirect(`/${locale}/onboarding?role=seller`);
    }

    if (seller.status === 'pending') {
        redirect(`/${locale}/onboarding?role=seller`);
    }

    if (seller.status === 'rejected') {
        redirect(`/${locale}/onboarding?role=seller`);
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
            navItems={sellerNavItems(locale)}
            user={{
                name: seller.business_name || profile?.full_name || user.email?.split('@')[0] || 'Seller',
                email: user.email || '',
            }}
            notificationCount={notificationCount || 0}
        >
            {children}
        </DashboardLayout>
    );
}
