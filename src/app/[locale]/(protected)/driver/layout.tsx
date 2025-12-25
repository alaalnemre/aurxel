import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { driverNavItems } from '@/components/layout/sidebar';

// Force dynamic rendering and Node.js runtime - required for auth cookies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface DriverLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function DriverLayout({ children, params }: DriverLayoutProps) {
    const { locale } = await params;

    console.error('[DRIVER_LAYOUT] ===== START =====');

    let user = null;
    let driver = null;
    let profile = null;
    let notificationCount = 0;
    let redirectTo: string | null = null;

    try {
        const supabase = await createClient();

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[DRIVER_LAYOUT] Auth error:', authError.message);
        }

        if (!authUser) {
            redirectTo = `/${locale}/login`;
        } else {
            user = authUser;

            // Check if user is an approved driver
            const { data: driverData, error: driverError } = await supabase
                .from('drivers')
                .select('status')
                .eq('user_id', user.id)
                .maybeSingle();

            if (driverError) {
                console.error('[DRIVER_LAYOUT] Driver fetch error:', driverError.message, driverError.code);
            }

            driver = driverData;

            if (!driver || driver.status === 'pending' || driver.status === 'rejected') {
                redirectTo = `/${locale}/onboarding?role=driver`;
            } else {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profileError) {
                    console.error('[DRIVER_LAYOUT] Profile fetch error:', profileError.message);
                }

                profile = profileData;

                const { count, error: notifError } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .is('read_at', null);

                if (notifError) {
                    console.error('[DRIVER_LAYOUT] Notification count error:', notifError.message);
                }

                notificationCount = count || 0;
            }
        }
    } catch (error) {
        console.error('[DRIVER_LAYOUT] Catch block:', error);
        // Re-throw redirect errors
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error;
        }
    }

    // CRITICAL: redirect() MUST be called OUTSIDE of try/catch
    if (redirectTo) {
        console.error('[DRIVER_LAYOUT] Redirecting to:', redirectTo);
        redirect(redirectTo);
    }

    if (!user || !driver) {
        console.error('[DRIVER_LAYOUT] Fallback - no user or driver');
        return (
            <div className="min-h-screen bg-background">
                <div className="p-6">{children}</div>
            </div>
        );
    }

    console.error('[DRIVER_LAYOUT] ===== RENDERING =====');

    return (
        <DashboardLayout
            locale={locale}
            navItems={driverNavItems(locale)}
            user={{
                name: profile?.full_name || user.email?.split('@')[0] || 'Driver',
                email: user.email || '',
            }}
            notificationCount={notificationCount}
        >
            {children}
        </DashboardLayout>
    );
}
