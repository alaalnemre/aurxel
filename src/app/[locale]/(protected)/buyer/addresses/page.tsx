import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getProfile } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const runtime = 'nodejs';

export default async function BuyerAddressesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const profile = await getProfile();

    if (!profile) {
        redirect(`/${locale}/login`);
    }

    const supabase = await createClient();

    // Get unique delivery addresses from past orders
    const { data: orders } = await supabase
        .from('orders')
        .select('address, city, phone, created_at')
        .eq('buyer_profile_id', profile.id)
        .order('created_at', { ascending: false });

    // Extract unique addresses
    const addressMap = new Map<string, { address: string; city: string; phone: string; lastUsed: string }>();
    orders?.forEach(order => {
        const key = `${order.address}-${order.city}`;
        if (!addressMap.has(key)) {
            addressMap.set(key, {
                address: order.address,
                city: order.city,
                phone: order.phone,
                lastUsed: order.created_at,
            });
        }
    });

    const savedAddresses = Array.from(addressMap.values()).slice(0, 5);

    // Profile address
    const profileAddress = profile.address && profile.city ? {
        address: profile.address,
        city: profile.city,
        phone: profile.phone || '',
        isDefault: true,
    } : null;

    return (
        <div>
            <PageHeader
                title={t('buyer.addressesTitle')}
                description={t('buyer.addressesSubtitle')}
            />

            {/* Default Address from Profile */}
            {profileAddress && (
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">{t('buyer.defaultAddress')}</h3>
                    <div className="bg-primary-soft border-2 border-primary rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                                        {t('buyer.default')}
                                    </span>
                                </div>
                                <p className="font-medium text-dark">{profileAddress.address}</p>
                                <p className="text-gray-600">{profileAddress.city}</p>
                                {profileAddress.phone && (
                                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {profileAddress.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Delivery Addresses */}
            <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">{t('buyer.recentAddresses')}</h3>

                {savedAddresses.length > 0 ? (
                    <div className="space-y-4">
                        {savedAddresses.map((addr, index) => (
                            <div key={index} className="bg-white border border-border rounded-xl p-6 hover:border-primary transition-colors">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-dark">{addr.address}</p>
                                        <p className="text-gray-600">{addr.city}</p>
                                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {addr.phone}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {t('buyer.lastUsed')}: {new Date(addr.lastUsed).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !profileAddress ? (
                    <EmptyState
                        iconType="addresses"
                        title={t('buyer.noAddresses')}
                        description={t('buyer.noAddressesDesc')}
                    />
                ) : (
                    <p className="text-gray-400 text-center py-8">{t('buyer.noRecentAddresses')}</p>
                )}
            </div>

            {/* Tip */}
            <div className="mt-8 bg-info-soft rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-info flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-semibold text-dark mb-1">{t('buyer.addressTip')}</h4>
                        <p className="text-sm text-gray-600">{t('buyer.addressTipDesc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
