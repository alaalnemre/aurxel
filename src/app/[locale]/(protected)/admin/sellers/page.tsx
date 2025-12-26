import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { VerifyButton } from '@/components/admin/VerifyButton';

export default async function AdminSellersPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('admin');

    const supabase = await createClient();

    const { data: sellers } = await supabase
        .from('seller_profiles')
        .select(`
      id,
      business_name,
      business_address,
      is_verified,
      created_at,
      profile:profiles!seller_profiles_id_fkey(full_name, phone)
    `)
        .order('created_at', { ascending: false });

    const pendingCount = sellers?.filter(s => !s.is_verified).length || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('sellers')}</h1>
                {pendingCount > 0 && (
                    <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm font-medium">
                        {pendingCount} {locale === 'ar' ? 'بانتظار التحقق' : 'pending verification'}
                    </span>
                )}
            </div>

            {/* Sellers Table */}
            {sellers && sellers.length > 0 ? (
                <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-secondary border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'المتجر' : 'Store'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'المالك' : 'Owner'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'العنوان' : 'Address'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                                    <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {sellers.map((seller) => {
                                    const profile = Array.isArray(seller.profile) ? seller.profile[0] : seller.profile;
                                    return (
                                        <tr key={seller.id} className={`hover:bg-muted/30 ${!seller.is_verified ? 'bg-warning/5' : ''}`}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{seller.business_name}</p>
                                                <p className="text-xs text-secondary font-mono">{seller.id.slice(0, 8)}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p>{profile?.full_name || 'N/A'}</p>
                                                <p className="text-sm text-secondary">{profile?.phone || '-'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-secondary text-sm max-w-[200px] truncate">
                                                {seller.business_address || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {seller.is_verified ? (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                                                        ✓ {locale === 'ar' ? 'موثق' : 'Verified'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                                                        ⏳ {locale === 'ar' ? 'بانتظار' : 'Pending'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {!seller.is_verified && (
                                                    <VerifyButton
                                                        type="seller"
                                                        id={seller.id}
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
                    <div className="text-5xl mb-4">🏪</div>
                    <p className="text-secondary">{locale === 'ar' ? 'لا يوجد بائعين' : 'No sellers found'}</p>
                </div>
            )}
        </div>
    );
}
