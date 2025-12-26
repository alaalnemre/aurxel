import { createClient } from '@/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AdminQanzHistoryPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('admin');

    const supabase = await createClient();

    // Get all generated codes
    const { data: codes } = await supabase
        .from('topup_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    // Stats
    const { count: totalCodes } = await supabase.from('topup_codes').select('*', { count: 'exact', head: true });
    const { count: redeemedCodes } = await supabase.from('topup_codes').select('*', { count: 'exact', head: true }).not('redeemed_by', 'is', null);
    const { count: pendingCodes } = await supabase.from('topup_codes').select('*', { count: 'exact', head: true }).is('redeemed_by', null);

    // Total value
    const { data: allCodes } = await supabase.from('topup_codes').select('amount, redeemed_by');
    const totalValue = allCodes?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    const redeemedValue = allCodes?.filter(c => c.redeemed_by).reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('qanzControl')}</h1>
                <Link
                    href={`/${locale}/admin/qanz`}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    + {locale === 'ar' ? 'توليد أكواد' : 'Generate Codes'}
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label={locale === 'ar' ? 'إجمالي الأكواد' : 'Total Codes'}
                    value={totalCodes || 0}
                    icon="🎟️"
                />
                <StatCard
                    label={locale === 'ar' ? 'تم استخدامها' : 'Redeemed'}
                    value={redeemedCodes || 0}
                    icon="✅"
                />
                <StatCard
                    label={locale === 'ar' ? 'متاحة' : 'Available'}
                    value={pendingCodes || 0}
                    icon="⏳"
                />
                <StatCard
                    label={locale === 'ar' ? 'إجمالي القيمة' : 'Total Value'}
                    value={`${totalValue} JOD`}
                    icon="💎"
                />
            </div>

            {/* Progress */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex justify-between text-sm mb-2">
                    <span>{locale === 'ar' ? 'نسبة الاستخدام' : 'Redemption Rate'}</span>
                    <span className="font-medium">{totalCodes ? Math.round((redeemedCodes || 0) / totalCodes * 100) : 0}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        style={{ width: `${totalCodes ? ((redeemedCodes || 0) / totalCodes * 100) : 0}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-secondary mt-2">
                    <span>{locale === 'ar' ? 'مستخدم' : 'Redeemed'}: {redeemedValue} JOD</span>
                    <span>{locale === 'ar' ? 'متبقي' : 'Remaining'}: {totalValue - redeemedValue} JOD</span>
                </div>
            </div>

            {/* Codes Table */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-secondary border-b border-border bg-muted/50">
                                <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الكود' : 'Code'}</th>
                                <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'القيمة' : 'Amount'}</th>
                                <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</th>
                                <th className="px-4 py-3 font-medium">{locale === 'ar' ? 'تاريخ الاستخدام' : 'Redeemed'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {codes && codes.length > 0 ? (
                                codes.map((code) => (
                                    <tr key={code.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <code className="font-mono font-bold text-primary">{code.code}</code>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{code.amount} JOD</td>
                                        <td className="px-4 py-3">
                                            {code.redeemed_by ? (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                                    ✓ {locale === 'ar' ? 'مستخدم' : 'Redeemed'}
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                                    ⏳ {locale === 'ar' ? 'متاح' : 'Available'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-secondary text-sm">
                                            {new Date(code.created_at).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO')}
                                        </td>
                                        <td className="px-4 py-3 text-secondary text-sm">
                                            {code.redeemed_at
                                                ? new Date(code.redeemed_at).toLocaleDateString(locale === 'ar' ? 'ar-JO' : 'en-JO')
                                                : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-secondary">
                                        {locale === 'ar' ? 'لا توجد أكواد بعد' : 'No codes generated yet'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
    return (
        <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-secondary">{label}</p>
        </div>
    );
}
