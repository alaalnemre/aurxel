import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { ApprovalActions } from './ApprovalActions';

export const runtime = 'nodejs';

export default async function AdminApprovalsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile?.is_admin) redirect(`/${locale}/store`);

    const supabase = await createClient();

    const { data: pendingSellers } = await supabase.from('sellers').select(`*, profiles(full_name, phone)`).eq('status', 'pending');
    const { data: pendingDrivers } = await supabase.from('drivers').select(`*, profiles(full_name, phone)`).eq('status', 'pending');

    const hasPending = (pendingSellers?.length || 0) + (pendingDrivers?.length || 0) > 0;

    return (
        <div>
            <PageHeader title={t('admin.approvals')} />

            {hasPending ? (
                <div className="space-y-8">
                    {pendingSellers && pendingSellers.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">{t('admin.sellerApprovals')}</h2>
                            <div className="space-y-4">
                                {pendingSellers.map((seller) => {
                                    const prof = seller.profiles as { full_name: string | null; phone: string | null } | null;
                                    return (
                                        <Card key={seller.id}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{seller.store_name}</h3>
                                                    <p className="text-sm text-gray-500">{prof?.full_name} • {prof?.phone}</p>
                                                    <p className="text-sm text-gray-500">{seller.store_address}, {seller.store_city}</p>
                                                    {seller.description && <p className="text-sm text-gray-600 mt-1">{seller.description}</p>}
                                                </div>
                                                <ApprovalActions type="seller" id={seller.id} />
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {pendingDrivers && pendingDrivers.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">{t('admin.driverApprovals')}</h2>
                            <div className="space-y-4">
                                {pendingDrivers.map((driver) => {
                                    const prof = driver.profiles as { full_name: string | null; phone: string | null } | null;
                                    return (
                                        <Card key={driver.id}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{prof?.full_name}</h3>
                                                    <p className="text-sm text-gray-500">{prof?.phone}</p>
                                                    <p className="text-sm text-gray-500">{driver.vehicle_type} • {driver.plate_number}</p>
                                                </div>
                                                <ApprovalActions type="driver" id={driver.id} />
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState title={t('admin.noApprovals')} />
            )}
        </div>
    );
}
