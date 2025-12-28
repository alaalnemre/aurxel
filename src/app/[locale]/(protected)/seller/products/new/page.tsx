'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/StatusBadge';
import { sellerCreateProduct } from '@/actions/products';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Home', 'Beauty', 'Sports', 'Books', 'Other'];

export default function NewProductPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await sellerCreateProduct(formData);

        if (result.success) {
            router.push(`/${locale}/seller/products`);
        } else {
            setError(result.error || 'Failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href={`/${locale}/seller/products`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
                ← {t('common.back')}
            </Link>
            <PageHeader title={t('seller.addProduct')} />

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                    <Input name="title" label={t('product.title')} required />
                    <Textarea name="description" label={t('product.description')} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="priceJod" label={`${t('product.price')} (${t('common.currency')})`} type="number" step="0.01" min="0" required />
                        <Input name="stock" label={t('product.stock')} type="number" min="0" defaultValue="0" required />
                    </div>
                    <Select name="category" label={t('product.category')} options={[{ value: '', label: '' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} />
                    <Input name="images" label="Image URL (optional)" placeholder="https://..." />

                    <Button type="submit" className="w-full" isLoading={isLoading}>{t('common.save')}</Button>
                </form>
            </Card>
        </div>
    );
}
