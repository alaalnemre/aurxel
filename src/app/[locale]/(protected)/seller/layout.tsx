import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';
import { sellerNavItems } from '@/components/layout/sidebar';

// Force dynamic rendering and Node.js runtime - required for auth cookies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SellerLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function SellerLayout({ children, params }: SellerLayoutProps) {
    const { locale } = await params;

    console.error('[SELLER_LAYOUT] ===== START =====');

    let user = null;
    let seller = null;
    let profile = null;
    let notificationCount = 0;
    let redirectTo: string | null = null;

    try {
        const supabase = await createClient();

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[SELLER_LAYOUT] Auth error:', authError.message);
        }

        if (!authUser) {
            redirectTo = `/${locale}/login`;
        } else {
            user = authUser;

            // Check if user is an approved seller
            const { data: sellerData, error: sellerError } = await supabase
                .from('sellers')
                .select('status, business_name')
                .eq('user_id', user.id)
                .maybeSingle();

            if (sellerError) {
                console.error('[SELLER_LAYOUT] Seller fetch error:', sellerError.message, sellerError.code);
            }

            seller = sellerData;

            if (!seller || seller.status === 'pending' || seller.status === 'rejected') {
                redirectTo = `/${locale}/onboarding?role=seller`;
            } else {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .maybeSingle();

                if (profileError) {
                    console.error('[SELLER_LAYOUT] Profile fetch error:', profileError.message);
                }

                profile = profileData;

                const { count, error: notifError } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .is('read_at', null);

                if (notifError) {
                    console.error('[SELLER_LAYOUT] Notification count error:', notifError.message);
                }

                notificationCount = count || 0;
            }
        }
    } catch (error) {
        console.error('[SELLER_LAYOUT] Catch block:', error);
        // Re-throw redirect errors
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error;
        }
    }

    // CRITICAL: redirect() MUST be called OUTSIDE of try/catch
    if (redirectTo) {
        console.error('[SELLER_LAYOUT] Redirecting to:', redirectTo);
        redirect(redirectTo);
    }

    if (!user || !seller) {
        console.error('[SELLER_LAYOUT] Fallback - no user or seller');
        return (
            <div className="min-h-screen bg-background">
                <div className="p-6">{children}</div>
            </div>
        );
    }

    console.error('[SELLER_LAYOUT] ===== RENDERING =====');

    return (
        <DashboardLayout
            locale={locale}
            navItems={sellerNavItems(locale)}
            user={{
                name: seller.business_name || profile?.full_name || user.email?.split('@')[0] || 'Seller',
                email: user.email || '',
            }}
            notificationCount={notificationCount}
        >
            {children}
        </DashboardLayout>
    );
}
