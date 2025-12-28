import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { DisputeActions } from './DisputeActions';

export const runtime = 'nodejs';

export default async function AdminDisputesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) redirect(`/${locale}/store`);

    const supabase = await createClient();
    const { data: disputes } = await supabase
        .from('disputes')
        .select(`*, orders(id), profiles(full_name)`)
        .order('created_at', { ascending: false });

    return (
        <div>
            <PageHeader title={t('admin.disputeList')} />

            {disputes && disputes.length > 0 ? (
                <div className="space-y-4">
                    {disputes.map((dispute) => {
                        const order = dispute.orders as { id: string } | null;
                        const opener = dispute.profiles as { full_name: string | null } | null;
                        return (
                            <Card key={dispute.id}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-medium">Order #{order?.id.slice(0, 8)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${dispute.status === 'open' ? 'bg-red-100 text-red-700' : dispute.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {dispute.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">Opened by: {opener?.full_name}</p>
                                        <p className="text-sm text-gray-600 mt-2">{dispute.reason}</p>
                                        {dispute.resolution && <p className="text-sm text-green-600 mt-1">Resolution: {dispute.resolution}</p>}
                                    </div>
                                    {dispute.status !== 'resolved' && dispute.status !== 'rejected' && (
                                        <DisputeActions disputeId={dispute.id} status={dispute.status} />
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState title={t('admin.noDisputes')} />
            )}
        </div>
    );
}
