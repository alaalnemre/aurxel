import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { buyerNavItems } from '@/components/layout/sidebar';

// Force dynamic rendering and Node.js runtime - required for auth cookies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface BuyerLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function BuyerLayout({ children, params }: BuyerLayoutProps) {
    const { locale } = await params;

    console.error('[BUYER_LAYOUT] ===== START =====');
    console.error('[BUYER_LAYOUT] Locale:', locale);

    let user = null;
    let profile = null;
    let notificationCount = 0;

    try {
        console.error('[BUYER_LAYOUT] Creating Supabase client...');
        const supabase = await createClient();
        console.error('[BUYER_LAYOUT] Supabase client created');

        // Get user with JWT validation
        console.error('[BUYER_LAYOUT] Getting user...');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        console.error('[BUYER_LAYOUT] Auth result:', {
            hasUser: !!authUser,
            userId: authUser?.id || 'none',
            email: authUser?.email || 'none',
            error: authError?.message || 'none',
            errorCode: authError?.code || 'none'
        });

        if (authError) {
            console.error('[BUYER_LAYOUT] Auth ERROR:', authError.message, authError.code);
        }

        if (!authUser) {
            console.error('[BUYER_LAYOUT] No user - redirecting to login');
            // IMPORTANT: redirect() must be called OUTSIDE of try/catch
            // Store the need to redirect and do it after
        }

        user = authUser;

        if (user) {
            // Fetch profile
            console.error('[BUYER_LAYOUT] Fetching profile for:', user.id);
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', user.id)
                .maybeSingle();

            console.error('[BUYER_LAYOUT] Profile result:', {
                hasProfile: !!profileData,
                fullName: profileData?.full_name || 'none',
                role: profileData?.role || 'none',
                error: profileError?.message || 'none',
                errorCode: profileError?.code || 'none',
                errorDetails: profileError?.details || 'none'
            });

            if (profileError) {
                console.error('[BUYER_LAYOUT] Profile ERROR:', profileError.message, profileError.code, profileError.details);
            }

            profile = profileData;

            // Get notification count
            console.error('[BUYER_LAYOUT] Fetching notifications...');
            const { count, error: notifError } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .is('read_at', null);

            console.error('[BUYER_LAYOUT] Notifications result:', {
                count: count || 0,
                error: notifError?.message || 'none'
            });

            if (notifError) {
                console.error('[BUYER_LAYOUT] Notifications ERROR:', notifError.message, notifError.code);
            }

            notificationCount = count || 0;
        }
    } catch (error) {
        console.error('[BUYER_LAYOUT] ===== CATCH BLOCK =====');
        console.error('[BUYER_LAYOUT] Error type:', typeof error);
        console.error('[BUYER_LAYOUT] Error name:', error instanceof Error ? error.name : 'unknown');
        console.error('[BUYER_LAYOUT] Error message:', error instanceof Error ? error.message : String(error));
        console.error('[BUYER_LAYOUT] Full error:', error);

        // CRITICAL: Re-throw redirect errors - they are NOT real errors
        // Next.js uses throw for redirect(), we must not swallow it
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            console.error('[BUYER_LAYOUT] Re-throwing NEXT_REDIRECT');
            throw error;
        }

        // For other errors, log and continue with fallback
        console.error('[BUYER_LAYOUT] Continuing with fallback layout');
    }

    // IMPORTANT: redirect MUST be called OUTSIDE of try/catch
    if (!user) {
        console.error('[BUYER_LAYOUT] Executing redirect to login (outside try/catch)');
        redirect(`/${locale}/login`);
    }

    console.error('[BUYER_LAYOUT] ===== RENDERING DASHBOARD =====');
    console.error('[BUYER_LAYOUT] User:', user.id, user.email);
    console.error('[BUYER_LAYOUT] Profile:', profile?.full_name || 'none');

    return (
        <DashboardLayout
            locale={locale}
            navItems={buyerNavItems(locale)}
            user={{
                name: profile?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
            }}
            notificationCount={notificationCount}
        >
            {children}
        </DashboardLayout>
    );
}
