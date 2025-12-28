'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/StatusBadge';
import { sellerUpdateProduct, sellerDeleteProduct } from '@/actions/products';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Home', 'Beauty', 'Sports', 'Books', 'Other'];

export default function EditProductPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const productId = params.id as string;
    const [product, setProduct] = useState<{ title: string; description: string | null; price_jod: number; stock: number; category: string | null; is_active: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('products').select('*').eq('id', productId).maybeSingle();
            setProduct(data);
        };
        if (productId) fetchProduct();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        formData.append('productId', productId);
        const result = await sellerUpdateProduct(formData);

        if (result.success) {
            router.push(`/${locale}/seller/products`);
        } else {
            setError(result.error || 'Failed');
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t('seller.deleteConfirm'))) return;
        const formData = new FormData();
        formData.append('productId', productId);
        await sellerDeleteProduct(formData);
        router.push(`/${locale}/seller/products`);
    };

    if (!product) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <Link href={`/${locale}/seller/products`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">← {t('common.back')}</Link>
            <PageHeader title={t('seller.editProduct')} />

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                    <Input name="title" label={t('product.title')} defaultValue={product.title} required />
                    <Textarea name="description" label={t('product.description')} defaultValue={product.description || ''} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="priceJod" label={`${t('product.price')} (${t('common.currency')})`} type="number" step="0.01" min="0" defaultValue={product.price_jod} required />
                        <Input name="stock" label={t('product.stock')} type="number" min="0" defaultValue={product.stock} required />
                    </div>
                    <Select name="category" label={t('product.category')} defaultValue={product.category || ''} options={[{ value: '', label: '' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} />

                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="isActive" value="true" defaultChecked={product.is_active} className="w-4 h-4" />
                        <span>Active</span>
                    </label>

                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1" isLoading={isLoading}>{t('common.save')}</Button>
                        <Button type="button" variant="danger" onClick={handleDelete}>{t('common.delete')}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
