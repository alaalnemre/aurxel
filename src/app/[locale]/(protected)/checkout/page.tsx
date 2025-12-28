'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { buyerPlaceOrder, getCartSummary } from '@/actions/orders';
import { validateDiscountCode, DiscountValidationResult } from '@/actions/discounts';

const CITIES = ['amman', 'zarqa', 'irbid', 'aqaba', 'madaba', 'jerash', 'salt', 'karak', 'mafraq'];

export default function CheckoutPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Cart summary state
    const [cartSummary, setCartSummary] = useState<{ subtotal: number; itemCount: number } | null>(null);

    // Discount state
    const [discountCode, setDiscountCode] = useState('');
    const [discountValidation, setDiscountValidation] = useState<DiscountValidationResult | null>(null);
    const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
    const [discountError, setDiscountError] = useState('');

    // Load cart summary on mount
    useEffect(() => {
        const loadCart = async () => {
            const result = await getCartSummary();
            if (result.success && result.data) {
                setCartSummary(result.data);
            }
        };
        loadCart();
    }, []);

    const deliveryFee = 2.00;
    const subtotal = cartSummary?.subtotal || 0;
    const discountAmount = discountValidation?.valid ? (discountValidation.discountAmount || 0) : 0;
    const total = subtotal + deliveryFee - discountAmount;

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            setDiscountError(t('discounts.enterCode'));
            return;
        }

        setIsValidatingDiscount(true);
        setDiscountError('');
        setDiscountValidation(null);

        // Need profile ID - we'll pass it from the server action
        const result = await validateDiscountCode(discountCode, subtotal, '');

        setIsValidatingDiscount(false);

        if (result.valid) {
            setDiscountValidation(result);
            setDiscountError('');
        } else {
            setDiscountError(t(result.reason || 'discounts.invalidCode'));
            setDiscountValidation(null);
        }
    };

    const handleRemoveDiscount = () => {
        setDiscountCode('');
        setDiscountValidation(null);
        setDiscountError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        // Add discount info if validated
        if (discountValidation?.valid && discountValidation.discountId) {
            formData.set('discountCodeId', discountValidation.discountId);
            formData.set('discountAmount', String(discountValidation.discountAmount || 0));
        }

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

                {/* Discount Code Section */}
                <Card>
                    <h2 className="font-semibold mb-4">{t('discounts.discountCode')}</h2>

                    {discountValidation?.valid ? (
                        <div className="flex items-center justify-between p-3 bg-success-soft rounded-lg border border-success">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium text-success">{discountCode.toUpperCase()}</span>
                                <span className="text-sm text-success">
                                    ({discountValidation.discountType === 'percentage'
                                        ? `${discountValidation.discountValue}%`
                                        : `${discountValidation.discountValue} ${t('common.currency')}`} {t('discounts.off')})
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveDiscount}
                                className="text-sm text-gray-500 hover:text-error"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    name="discountCode"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                    placeholder={t('discounts.enterCode')}
                                    className="uppercase"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyDiscount}
                                isLoading={isValidatingDiscount}
                            >
                                {t('discounts.apply')}
                            </Button>
                        </div>
                    )}

                    {discountError && (
                        <p className="mt-2 text-sm text-error">{discountError}</p>
                    )}
                </Card>

                {/* Order Summary */}
                <Card>
                    <h2 className="font-semibold mb-4">{t('checkout.orderSummary')}</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('checkout.subtotal')}</span>
                            <span>{subtotal.toFixed(2)} {t('common.currency')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('checkout.deliveryFee')}</span>
                            <span>{deliveryFee.toFixed(2)} {t('common.currency')}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-success">
                                <span>{t('discounts.discount')}</span>
                                <span>-{discountAmount.toFixed(2)} {t('common.currency')}</span>
                            </div>
                        )}
                        <div className="border-t pt-3 flex justify-between font-semibold">
                            <span>{t('checkout.total')}</span>
                            <span className="text-primary">{total.toFixed(2)} {t('common.currency')}</span>
                        </div>
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
                            <p className="text-sm text-green-600">{t('checkout.payOnArrival')}</p>
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
