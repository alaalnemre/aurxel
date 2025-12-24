import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ShoppingBag, Truck, Shield } from 'lucide-react';

interface HomePageProps {
    params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <HomeContent locale={locale} />;
}

function HomeContent({ locale }: { locale: string }) {
    const t = useTranslations();

    const features = [
        {
            icon: ShoppingBag,
            title: locale === 'ar' ? 'تسوق بسهولة' : 'Shop Easily',
            description: locale === 'ar'
                ? 'تصفح آلاف المنتجات من بائعين موثوقين في الأردن'
                : 'Browse thousands of products from trusted sellers across Jordan',
        },
        {
            icon: Store,
            title: locale === 'ar' ? 'بِع منتجاتك' : 'Sell Your Products',
            description: locale === 'ar'
                ? 'ابدأ متجرك الخاص وابدأ البيع اليوم'
                : 'Start your own store and begin selling today',
        },
        {
            icon: Truck,
            title: locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery',
            description: locale === 'ar'
                ? 'شبكة سائقين موثوقين لتوصيل طلباتك'
                : 'Reliable driver network to deliver your orders',
        },
        {
            icon: Shield,
            title: locale === 'ar' ? 'دفع آمن' : 'Secure Payment',
            description: locale === 'ar'
                ? 'الدفع عند الاستلام - لا حاجة لبطاقة ائتمان'
                : 'Cash on delivery - no credit card needed',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl">
                        <Store className="h-6 w-6" />
                        <span>{t('common.appName')}</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href={locale === 'en' ? '/ar' : '/en'}>
                            <Button variant="ghost" size="sm">
                                {locale === 'en' ? 'العربية' : 'English'}
                            </Button>
                        </Link>
                        <Link href={`/${locale}/login`}>
                            <Button variant="ghost" size="sm">{t('auth.signIn')}</Button>
                        </Link>
                        <Link href={`/${locale}/register`}>
                            <Button size="sm">{t('auth.signUp')}</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        {locale === 'ar'
                            ? 'أكبر سوق إلكتروني في الأردن'
                            : "Jordan's Premier Online Marketplace"}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {locale === 'ar'
                            ? 'اشترِ وبِع واستلم بكل سهولة. الدفع عند الاستلام فقط.'
                            : 'Buy, sell, and deliver with ease. Cash on delivery only.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href={`/${locale}/register`}>
                            <Button size="lg">{t('auth.createAccount')}</Button>
                        </Link>
                        <Link href={`/${locale}/login`}>
                            <Button size="lg" variant="outline">{t('auth.signIn')}</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        {locale === 'ar' ? 'لماذا سوق الأردن؟' : 'Why JordanMarket?'}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <feature.icon className="h-10 w-10 mb-2 text-primary" />
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA for Sellers/Drivers */}
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle>
                                    {locale === 'ar' ? 'هل أنت بائع؟' : 'Are you a Seller?'}
                                </CardTitle>
                                <CardDescription>
                                    {locale === 'ar'
                                        ? 'انضم إلى آلاف البائعين وابدأ بيع منتجاتك اليوم'
                                        : 'Join thousands of sellers and start selling your products today'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/${locale}/register?role=seller`}>
                                    <Button className="w-full">{t('roles.becomeASeller')}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle>
                                    {locale === 'ar' ? 'هل أنت سائق؟' : 'Are you a Driver?'}
                                </CardTitle>
                                <CardDescription>
                                    {locale === 'ar'
                                        ? 'اكسب دخلاً إضافياً بتوصيل الطلبات في مدينتك'
                                        : 'Earn extra income by delivering orders in your city'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/${locale}/register?role=driver`}>
                                    <Button className="w-full" variant="outline">{t('roles.becomeADriver')}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>© 2024 JordanMarket. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
                </div>
            </footer>
        </div>
    );
}
