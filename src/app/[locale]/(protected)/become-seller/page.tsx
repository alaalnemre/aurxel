'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/StatusBadge';
import { requestSellerActivation } from '@/actions/profile';
import { createClient } from '@/lib/supabase/client';

const CITIES = ['amman', 'zarqa', 'irbid', 'aqaba', 'madaba', 'jerash', 'salt', 'karak'];

export default function BecomeSellerPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'en';
    const [profile, setProfile] = useState<{ seller_requested: boolean; seller_verified: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('seller_requested, seller_verified').eq('id', user.id).maybeSingle();
                setProfile(data);
            }
        };
        fetchProfile();
    }, []);

    if (profile?.seller_verified) {
        return (
            <div className="max-w-xl mx-auto text-center">
                <div className="bg-green-50 rounded-xl p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
                    <h2 className="text-xl font-bold text-green-800">{t('becomeSeller.alreadyVerified')}</h2>
                </div>
            </div>
        );
    }

    if (profile?.seller_requested) {
        return (
            <div className="max-w-xl mx-auto text-center">
                <div className="bg-yellow-50 rounded-xl p-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">⏳</div>
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">{t('becomeSeller.requestSubmitted')}</h2>
                    <p className="text-yellow-700">{t('becomeSeller.requestPending')}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-xl mx-auto text-center">
                <div className="bg-green-50 rounded-xl p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
                    <h2 className="text-xl font-bold text-green-800 mb-2">{t('becomeSeller.requestSubmitted')}</h2>
                    <p className="text-green-700">{t('becomeSeller.requestPending')}</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await requestSellerActivation(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto">
            <PageHeader title={t('becomeSeller.title')} description={t('becomeSeller.description')} />

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                    <Input name="storeName" label={t('becomeSeller.storeName')} placeholder={t('becomeSeller.storeNamePlaceholder')} required />
                    <Textarea name="description" label={t('becomeSeller.storeDescription')} placeholder={t('becomeSeller.storeDescriptionPlaceholder')} />
                    <Input name="storeAddress" label={t('becomeSeller.storeAddress')} placeholder={t('becomeSeller.storeAddressPlaceholder')} required />
                    <Select name="storeCity" label={t('becomeSeller.storeCity')} options={CITIES.map(c => ({ value: t(`cities.${c}`), label: t(`cities.${c}`) }))} />
                    <Input name="storePhone" label={t('becomeSeller.storePhone')} placeholder={t('becomeSeller.storePhonePlaceholder')} required />

                    <Button type="submit" className="w-full" isLoading={isLoading}>{t('becomeSeller.submit')}</Button>
                </form>
            </Card>
        </div>
    );
}
