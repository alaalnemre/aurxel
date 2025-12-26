import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { VerifyButton } from '@/components/admin/VerifyButton';

export default async function AdminDriversPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('admin');

    const supabase = await createClient();

    const { data: drivers } = await supabase
        .from('driver_profiles')
        .select(`
      id,
      vehicle_type,
      is_verified,
      is_available,
      created_at,
      profile:profiles!driver_profiles_id_fkey(full_name, phone)
    `)
        .order('created_at', { ascending: false });

    const pendingCount = drivers?.filter(d => !d.is_verified).length || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('drivers')}</h1>
                {pendingCount > 0 && (
                    <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-medium">
                        {pendingCount} {locale === 'ar' ? 'بانتظار التحقق' : 'pending verification'}
                    </span>
                )}
            </div>

            {/* Drivers Table */}
            {drivers && drivers.length > 0 ? (
                <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'السائق' : 'Driver'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الهاتف' : 'Phone'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'المركبة' : 'Vehicle'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {drivers.map((driver) => {
                                    const profile = Array.isArray(driver.profile) ? driver.profile[0] : driver.profile;
                                    return (
                                        <tr key={driver.id} className={`hover:bg-muted/30 ${!driver.is_verified ? 'bg-warning/5' : ''}`}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{profile?.full_name || 'N/A'}</p>
                                                <p className="text-xs text-secondary font-mono">{driver.id.slice(0, 8)}</p>
                                            </td>
                                            <td className="px-4 py-3 text-secondary">
                                                {profile?.phone || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-lg">
                                                    {driver.vehicle_type === 'motorcycle' ? '🏍️' : driver.vehicle_type === 'car' ? '🚗' : '🚚'}
                                                </span>
                                                <span className="text-sm text-secondary ml-1">{driver.vehicle_type || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    {driver.is_verified ? (
                                                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                                                            ✓ {locale === 'ar' ? 'موثق' : 'Verified'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                                                            ⏳ {locale === 'ar' ? 'بانتظار' : 'Pending'}
                                                        </span>
                                                    )}
                                                    {driver.is_available && (
                                                        <span className="text-xs text-success">🟢 {locale === 'ar' ? 'متاح' : 'Online'}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {!driver.is_verified && (
                                                    <VerifyButton
                                                        type="driver"
                                                        id={driver.id}
                                                        locale={locale}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-2xl">
                    <div className="text-5xl mb-4">🛵</div>
                    <p className="text-secondary">{locale === 'ar' ? 'لا يوجد سائقين' : 'No drivers found'}</p>
                </div>
            )}
        </div>
    );
}
