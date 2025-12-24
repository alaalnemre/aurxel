import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { TopupForm, RevokeButton, CopyCodeButton } from '@/components/admin/topup-form';

interface AdminTopupPageProps {
    params: Promise<{ locale: string }>;
}

export default async function AdminTopupPage({ params }: AdminTopupPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();

    // Get topup codes
    const { data: codes } = await supabase
        .from('topup_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    const activeCodes = codes?.filter(c => c.status === 'active') || [];
    const redeemedCodes = codes?.filter(c => c.status === 'redeemed') || [];
    const revokedCodes = codes?.filter(c => c.status === 'revoked') || [];

    const t = {
        title: locale === 'ar' ? 'أكواد الشحن' : 'Top-up Codes',
        active: locale === 'ar' ? 'نشط' : 'Active',
        redeemed: locale === 'ar' ? 'مستخدم' : 'Redeemed',
        revoked: locale === 'ar' ? 'ملغي' : 'Revoked',
        noCodes: locale === 'ar' ? 'لا توجد أكواد' : 'No codes',
        createdOn: locale === 'ar' ? 'أنشئ في' : 'Created',
        allCodes: locale === 'ar' ? 'جميع الأكواد' : 'All Codes',
    };

    const statusBadges = {
        active: { variant: 'default' as const, icon: CheckCircle, class: 'bg-green-100 text-green-800' },
        redeemed: { variant: 'secondary' as const, icon: null, class: '' },
        revoked: { variant: 'destructive' as const, icon: XCircle, class: '' },
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">{t.active}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeCodes.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t.redeemed}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{redeemedCodes.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">{t.revoked}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{revokedCodes.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Generate New Code */}
            <TopupForm locale={locale} />

            {/* Codes List */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.allCodes}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {!codes || codes.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            {t.noCodes}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {codes.map((code) => {
                                const statusConfig = statusBadges[code.status as keyof typeof statusBadges];
                                return (
                                    <div key={code.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded bg-muted px-3 py-1 font-mono text-sm">
                                                    {code.code}
                                                </div>
                                                <CopyCodeButton code={code.code} />
                                            </div>
                                            <div>
                                                <p className="font-medium">{Number(code.amount).toFixed(2)} QANZ</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t.createdOn} {new Date(code.created_at).toLocaleDateString(locale)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusConfig?.variant || 'default'} className={statusConfig?.class}>
                                                {code.status}
                                            </Badge>
                                            {code.status === 'active' && (
                                                <RevokeButton codeId={code.id} locale={locale} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
