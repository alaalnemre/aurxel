'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { buyerPlaceOrder } from '@/actions/orders';

const CITIES = ['amman', 'zarqa', 'irbid', 'aqaba', 'madaba', 'jerash', 'salt', 'karak', 'mafraq'];

export default function CheckoutPage() {
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
        const result = await buyerPlaceOrder(formData);

        if (result.success && result.data) {
            router.push(`/${locale}/orders/${result.data.orderId}`);
        } else {
            setError(result.error || 'Order failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('checkout.title')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <h2 className="font-semibold mb-4">{t('checkout.deliveryAddress')}</h2>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                    <div className="space-y-4">
                        <Input name="address" label={t('checkout.address')} required placeholder="Street, Building, Floor..." />
                        <Select
                            name="city"
                            label={t('checkout.city')}
                            options={CITIES.map(c => ({ value: t(`cities.${c}`), label: t(`cities.${c}`) }))}
                        />
                        <Input name="phone" label={t('checkout.phone')} type="tel" required placeholder="07XXXXXXXX" />
                        <Textarea name="notes" label={t('checkout.notes')} placeholder={t('checkout.orderNotes')} />
                    </div>
                </Card>

                <Card>
                    <h2 className="font-semibold mb-4">{t('checkout.paymentMethod')}</h2>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-lg">💵</span>
                        </div>
                        <div>
                            <p className="font-medium text-green-800">{t('checkout.cashOnDelivery')}</p>
                            <p className="text-sm text-green-600">Pay when your order arrives</p>
                        </div>
                    </div>
                </Card>

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                    {t('checkout.placeOrder')}
                </Button>
            </form>
        </div>
    );
}
