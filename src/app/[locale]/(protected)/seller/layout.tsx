import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { authorize } from '@/lib/auth/authorize';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const result = await authorize({ requiredRole: 'seller', locale });

    if (!result.authorized && result.redirectTo) {
        redirect({ href: result.redirectTo.replace(`/${locale}`, ''), locale });
    }

    return <>{children}</>;
}
