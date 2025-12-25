import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BuyerDashboardProps {
    params: Promise<{ locale: string }>;
}

export default async function BuyerDashboard({ params }: BuyerDashboardProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get profile (maybeSingle to handle edge cases)
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user!.id)
        .maybeSingle();

    // Get recent orders count
    const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user!.id);

    // Get wallet balance (maybeSingle to handle new users without wallet yet)
    const { data: wallet } = await supabase
        .from('wallet_accounts')
        .select('balance')
        .eq('owner_id', user!.id)
        .maybeSingle();

    const greeting = locale === 'ar'
        ? `مرحباً، ${profile?.full_name || 'متسوق'}!`
        : `Welcome, ${profile?.full_name || 'Shopper'}!`;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{greeting}</h1>
                <p className="text-muted-foreground">
                    {locale === 'ar'
                        ? 'ماذا تريد أن تفعل اليوم؟'
                        : 'What would you like to do today?'}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'طلباتي' : 'My Orders'}
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ordersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {locale === 'ar' ? 'إجمالي الطلبات' : 'Total orders'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance'}
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {wallet?.balance?.toFixed(2) || '0.00'}
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                                {locale === 'ar' ? 'قنز' : 'QANZ'}
                            </span>
                        </div>
                        <Link href={`/${locale}/buyer/wallet`} className="text-xs text-primary hover:underline">
                            {locale === 'ar' ? 'شحن الرصيد' : 'Top up'}
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {locale === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/buyer/shop`}>
                            <Button variant="secondary" size="sm" className="w-full">
                                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Become Seller/Driver CTAs */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{locale === 'ar' ? 'هل تريد البيع؟' : 'Want to Sell?'}</CardTitle>
                        <CardDescription>
                            {locale === 'ar'
                                ? 'ابدأ متجرك الخاص وابدأ البيع على سوق الأردن'
                                : 'Start your own store and sell on JordanMarket'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/onboarding?role=seller`}>
                            <Button variant="outline" className="w-full">
                                {locale === 'ar' ? 'كن بائعاً' : 'Become a Seller'}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{locale === 'ar' ? 'هل تريد التوصيل؟' : 'Want to Deliver?'}</CardTitle>
                        <CardDescription>
                            {locale === 'ar'
                                ? 'انضم لفريق التوصيل واكسب دخلاً إضافياً'
                                : 'Join our delivery team and earn extra income'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={`/${locale}/onboarding?role=driver`}>
                            <Button variant="outline" className="w-full">
                                {locale === 'ar' ? 'كن سائقاً' : 'Become a Driver'}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
