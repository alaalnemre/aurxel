import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function DriverDashboard({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('driver');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch driver profile
    const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

    // Fetch stats
    const { count: availableDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

    const { count: activeDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', user?.id)
        .in('status', ['assigned', 'picked_up']);

    const { data: completedDeliveries } = await supabase
        .from('deliveries')
        .select('cash_collected')
        .eq('driver_id', user?.id)
        .eq('status', 'delivered');

    const totalCashCollected = completedDeliveries?.reduce(
        (sum, d) => sum + (Number(d.cash_collected) || 0),
        0
    ) || 0;

    // Today's earnings
    const today = new Date().toISOString().split('T')[0];
    const { data: todayDeliveries } = await supabase
        .from('deliveries')
        .select('cash_collected, delivered_at')
        .eq('driver_id', user?.id)
        .eq('status', 'delivered')
        .gte('delivered_at', today);

    const todayEarnings = todayDeliveries?.reduce(
        (sum, d) => sum + (Number(d.cash_collected) || 0),
        0
    ) || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
                {!driverProfile?.is_verified && (
                    <div className="px-3 py-1.5 bg-warning/10 text-warning text-sm rounded-full">
                        ⏳ {locale === 'ar' ? 'بانتظار التوثيق' : 'Pending Verification'}
                    </div>
                )}
                {driverProfile?.is_verified && (
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${driverProfile.is_active ? 'bg-success' : 'bg-secondary'}`} />
                        <span className="text-sm">
                            {driverProfile.is_active
                                ? (locale === 'ar' ? 'متاح' : 'Online')
                                : (locale === 'ar' ? 'غير متاح' : 'Offline')}
                        </span>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon="🚚"
                    label={t('availableDeliveries')}
                    value={String(availableDeliveries || 0)}
                    color="primary"
                    href={`/${locale}/driver/deliveries`}
                />
                <KPICard
                    icon="📦"
                    label={t('activeDeliveries')}
                    value={String(activeDeliveries || 0)}
                    color="warning"
                />
                <KPICard
                    icon="💵"
                    label={t('todayEarnings')}
                    value={`${todayEarnings.toFixed(2)} JOD`}
                    color="success"
                />
                <KPICard
                    icon="💰"
                    label={t('cashCollected')}
                    value={`${totalCashCollected.toFixed(2)} JOD`}
                    color="accent"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link
                    href={`/${locale}/driver/deliveries`}
                    className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all text-center group"
                >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
                    <span className="font-medium text-lg">{t('availableDeliveries')}</span>
                    {availableDeliveries && availableDeliveries > 0 && (
                        <span className="block text-sm text-primary mt-1">
                            {availableDeliveries} {locale === 'ar' ? 'متاحة' : 'available'}
                        </span>
                    )}
                </Link>
                <Link
                    href={`/${locale}/driver/earnings`}
                    className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all text-center group"
                >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💳</div>
                    <span className="font-medium text-lg">{t('earnings')}</span>
                </Link>
            </div>

            {/* Driver Status Toggle */}
            {driverProfile?.is_verified && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">
                        {locale === 'ar' ? 'حالة التوفر' : 'Availability Status'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button
                            className={`flex-1 py-3 rounded-xl font-medium transition-all ${driverProfile.is_active
                                    ? 'bg-success text-white'
                                    : 'bg-muted text-secondary hover:bg-success/10 hover:text-success'
                                }`}
                        >
                            {locale === 'ar' ? 'متاح للتوصيل' : 'Available'}
                        </button>
                        <button
                            className={`flex-1 py-3 rounded-xl font-medium transition-all ${!driverProfile.is_active
                                    ? 'bg-secondary text-white'
                                    : 'bg-muted text-secondary hover:bg-muted'
                                }`}
                        >
                            {locale === 'ar' ? 'غير متاح' : 'Offline'}
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Documents if not verified */}
            {!driverProfile?.is_verified && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-2">
                        {locale === 'ar' ? 'أكمل ملفك' : 'Complete Your Profile'}
                    </h2>
                    <p className="text-secondary mb-4">
                        {locale === 'ar'
                            ? 'ارفع وثائق الهوية للتحقق وبدء استلام التوصيلات'
                            : 'Upload ID documents to get verified and start receiving deliveries'}
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            className="text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({
    icon,
    label,
    value,
    color,
    href,
}: {
    icon: string;
    label: string;
    value: string;
    color: 'primary' | 'accent' | 'warning' | 'success';
    href?: string;
}) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        warning: 'bg-warning/10 text-warning',
        success: 'bg-success/10 text-success',
    };

    const content = (
        <>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <span className="text-lg">{icon}</span>
                </div>
                <span className="text-sm text-secondary">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </>
    );

    if (href) {
        return (
            <Link href={href} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
                {content}
            </Link>
        );
    }

    return <div className="bg-card rounded-2xl p-5 shadow-card">{content}</div>;
}
