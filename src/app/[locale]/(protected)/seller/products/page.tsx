import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ProductActions } from '@/components/seller/product-actions';

interface SellerProductsPageProps {
    params: Promise<{ locale: string }>;
}

export default async function SellerProductsPage({ params }: SellerProductsPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get seller
    const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user!.id)
        .single();

    // Get products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller?.id || '')
        .order('created_at', { ascending: false });

    const t = {
        title: locale === 'ar' ? 'المنتجات' : 'Products',
        addProduct: locale === 'ar' ? 'إضافة منتج' : 'Add Product',
        noProducts: locale === 'ar' ? 'لا توجد منتجات بعد' : 'No products yet',
        noProductsDesc: locale === 'ar'
            ? 'أضف منتجك الأول لبدء البيع'
            : 'Add your first product to start selling',
        active: locale === 'ar' ? 'نشط' : 'Active',
        inactive: locale === 'ar' ? 'غير نشط' : 'Inactive',
        lowStock: locale === 'ar' ? 'مخزون منخفض' : 'Low Stock',
        outOfStock: locale === 'ar' ? 'نفذ المخزون' : 'Out of Stock',
        stock: locale === 'ar' ? 'المخزون' : 'Stock',
        total: locale === 'ar' ? 'الإجمالي' : 'Total',
    };

    // Stats
    const totalProducts = products?.length || 0;
    const activeProducts = products?.filter(p => p.is_active && p.stock > 0).length || 0;
    const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 5).length || 0;
    const outOfStockProducts = products?.filter(p => p.stock === 0).length || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <Link href={`/${locale}/seller/products/new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t.addProduct}
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t.total}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">{t.active}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
                    </CardContent>
                </Card>
                <Card className={lowStockProducts > 0 ? 'border-yellow-500' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">{t.lowStock}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
                    </CardContent>
                </Card>
                <Card className={outOfStockProducts > 0 ? 'border-red-500' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">{t.outOfStock}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Products List */}
            {!products || products.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t.noProducts}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{t.noProductsDesc}</p>
                        <Link href={`/${locale}/seller/products/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {t.addProduct}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {locale === 'ar' ? product.title_ar : product.title_en}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {Number(product.price).toFixed(2)} JOD • {t.stock}: {product.stock}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {product.stock === 0 && (
                                            <Badge variant="destructive">{t.outOfStock}</Badge>
                                        )}
                                        {product.stock > 0 && product.stock <= 5 && (
                                            <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                {t.lowStock}
                                            </Badge>
                                        )}
                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                            {product.is_active ? t.active : t.inactive}
                                        </Badge>
                                        <ProductActions productId={product.id} isActive={product.is_active} locale={locale} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
