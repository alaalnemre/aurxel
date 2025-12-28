import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';

export default async function LocaleHomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const user = await getUser();

    if (user) {
        redirect(`/${locale}/store`);
    } else {
        redirect(`/${locale}/login`);
    }
}
