import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { adminNavItems } from '@/components/layout/sidebar';

// Force dynamic rendering and Node.js runtime - required for auth cookies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface AdminLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
    const { locale } = await params;

    console.error('[ADMIN_LAYOUT] ===== START =====');

    let user = null;
    let profile = null;
    let notificationCount = 0;
    let redirectTo: string | null = null;

    try {
        const supabase = await createClient();

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[ADMIN_LAYOUT] Auth error:', authError.message);
        }

        if (!authUser) {
            redirectTo = `/${locale}/login`;
        } else {
            user = authUser;

            // Check if user is admin
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', user.id)
                .maybeSingle();

            if (profileError) {
                console.error('[ADMIN_LAYOUT] Profile fetch error:', profileError.message);
            }

            profile = profileData;

            if (profile?.role !== 'admin') {
                console.error('[ADMIN_LAYOUT] User is not admin, role:', profile?.role);
                redirectTo = `/${locale}/unauthorized`;
            } else {
                const { count, error: notifError } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .is('read_at', null);

                if (notifError) {
                    console.error('[ADMIN_LAYOUT] Notification count error:', notifError.message);
                }

                notificationCount = count || 0;
            }
        }
    } catch (error) {
        console.error('[ADMIN_LAYOUT] Catch block:', error);
        // Re-throw redirect errors
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error;
        }
    }

    // CRITICAL: redirect() MUST be called OUTSIDE of try/catch
    if (redirectTo) {
        console.error('[ADMIN_LAYOUT] Redirecting to:', redirectTo);
        redirect(redirectTo);
    }

    if (!user || !profile || profile.role !== 'admin') {
        console.error('[ADMIN_LAYOUT] Fallback - not admin');
        return (
            <div className="min-h-screen bg-background">
                <div className="p-6">{children}</div>
            </div>
        );
    }

    console.error('[ADMIN_LAYOUT] ===== RENDERING =====');

    return (
        <DashboardLayout
            locale={locale}
            navItems={adminNavItems(locale)}
            user={{
                name: profile.full_name || 'Admin',
                email: user.email || '',
            }}
            notificationCount={notificationCount}
        >
            {children}
        </DashboardLayout>
    );
}
