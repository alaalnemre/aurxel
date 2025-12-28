import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';

export const runtime = 'nodejs';

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) redirect(`/${locale}/store`);

    const supabase = await createClient();
    const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);

    return (
        <div>
            <PageHeader title={t('admin.userList')} />

            {users && users.length > 0 ? (
                <div className="space-y-3">
                    {users.map((user) => (
                        <Card key={user.id} padding="sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{user.full_name || 'No name'}</p>
                                    <p className="text-sm text-gray-500">{user.phone || 'No phone'} • {user.city || 'No city'}</p>
                                </div>
                                <div className="flex gap-1">
                                    {user.is_admin && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Admin</span>}
                                    {user.seller_verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Seller</span>}
                                    {user.driver_verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Driver</span>}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title={t('admin.noUsers')} />
            )}
        </div>
    );
}
