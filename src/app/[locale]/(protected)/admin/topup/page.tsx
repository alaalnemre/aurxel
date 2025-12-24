import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

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
        generateCode: locale === 'ar' ? 'إنشاء كود' : 'Generate Code',
        amount: locale === 'ar' ? 'المبلغ' : 'Amount',
        generate: locale === 'ar' ? 'إنشاء' : 'Generate',
        active: locale === 'ar' ? 'نشط' : 'Active',
        redeemed: locale === 'ar' ? 'مستخدم' : 'Redeemed',
        revoked: locale === 'ar' ? 'ملغي' : 'Revoked',
        noCodes: locale === 'ar' ? 'لا توجد أكواد' : 'No codes',
        copyCode: locale === 'ar' ? 'نسخ' : 'Copy',
        revokeCode: locale === 'ar' ? 'إلغاء' : 'Revoke',
        createdOn: locale === 'ar' ? 'أنشئ في' : 'Created',
        redeemedBy: locale === 'ar' ? 'استخدم بواسطة' : 'Redeemed by',
    };

    const statusBadges = {
        active: { variant: 'default' as const, icon: CheckCircle, class: 'bg-green-100 text-green-800' },
        redeemed: { variant: 'secondary' as const, icon: Clock, class: '' },
        revoked: { variant: 'destructive' as const, icon: XCircle, class: '' },
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold">{t.title}</h1>
            </div>

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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {t.generateCode}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="amount">{t.amount} (QANZ)</Label>
                            <Input id="amount" type="number" placeholder="100" min="1" />
                        </div>
                        <Button type="submit">
                            <CreditCard className="h-4 w-4 mr-2" />
                            {t.generate}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Codes List */}
            <Card>
                <CardHeader>
                    <CardTitle>{locale === 'ar' ? 'جميع الأكواد' : 'All Codes'}</CardTitle>
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
                                            <div className="rounded bg-muted px-3 py-1 font-mono text-sm">
                                                {code.code}
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
                                                <Button variant="ghost" size="sm">
                                                    {t.revokeCode}
                                                </Button>
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
