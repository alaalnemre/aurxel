import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth/get-profile';
import {
    getRewardRules,
    getRecentRewardEvents,
    getRewardStats,
} from '@/lib/qanz/rewards';
import { RewardRulesList } from '@/components/admin/RewardRulesList';
import { Link } from '@/i18n/navigation';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminRewardsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Admin check
    const { profile } = await getProfile();
    if (!profile || profile.role !== 'admin') {
        redirect(`/${locale}/login`);
    }

    const [rules, events, stats] = await Promise.all([
        getRewardRules(),
        getRecentRewardEvents(50),
        getRewardStats(),
    ]);

    return (
        <RewardsContent
            rules={rules}
            events={events}
            stats={stats}
            locale={locale}
        />
    );
}

function RewardsContent({
    rules,
    events,
    stats,
    locale,
}: {
    rules: Awaited<ReturnType<typeof getRewardRules>>;
    events: Awaited<ReturnType<typeof getRecentRewardEvents>>;
    stats: Awaited<ReturnType<typeof getRewardStats>>;
    locale: string;
}) {
    const t = useTranslations();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/qanz"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2"
                    >
                        ← {t('common.back')}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t('rewards.adminTitle')}
                    </h1>
                    <p className="text-gray-600">{t('rewards.adminDescription')}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">{t('rewards.totalRewarded')}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.totalRewarded.toFixed(2)} <span className="text-lg">QANZ</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">{t('rewards.thisMonth')}</p>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.rewardsThisMonth.toFixed(2)} <span className="text-lg">QANZ</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">{t('rewards.activeRules')}</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">{t('rewards.totalEvents')}</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                    </div>
                </div>

                {/* Reward Rules */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t('rewards.rewardRules')}
                        </h2>
                    </div>
                    <RewardRulesList rules={rules} locale={locale} />
                </div>

                {/* Recent Events */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t('rewards.recentEvents')}
                        </h2>
                    </div>
                    {events.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {t('rewards.noEvents')}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {events.map((event) => (
                                <div key={event.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{event.key}</p>
                                        <p className="text-sm text-gray-500">
                                            {event.user?.full_name || 'Unknown'} • {event.reference_type}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">
                                            +{event.issued_amount} QANZ
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(event.created_at).toLocaleString(locale)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
