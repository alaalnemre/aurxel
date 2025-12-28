'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/StatusBadge';
import { requestDriverActivation } from '@/actions/profile';
import { createClient } from '@/lib/supabase/client';

export default function BecomeDriverPage({ params }: { params: Promise<{ locale: string }> }) {
    const t = useTranslations();
    const [profile, setProfile] = useState<{ driver_requested: boolean; driver_verified: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('driver_requested, driver_verified').eq('id', user.id).maybeSingle();
                setProfile(data);
            }
        };
        fetchProfile();
    }, []);

    if (profile?.driver_verified) {
        return (
            <div className="max-w-xl mx-auto text-center">
                <div className="bg-green-50 rounded-xl p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
                    <h2 className="text-xl font-bold text-green-800">{t('becomeDriver.alreadyVerified')}</h2>
                </div>
            </div>
        );
    }

    if (profile?.driver_requested || success) {
        return (
            <div className="max-w-xl mx-auto text-center">
                <div className="bg-yellow-50 rounded-xl p-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">⏳</div>
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">{t('becomeDriver.requestSubmitted')}</h2>
                    <p className="text-yellow-700">{t('becomeDriver.requestPending')}</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await requestDriverActivation(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto">
            <PageHeader title={t('becomeDriver.title')} description={t('becomeDriver.description')} />

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                    <Input name="vehicleType" label={t('becomeDriver.vehicleType')} placeholder={t('becomeDriver.vehicleTypePlaceholder')} required />
                    <Input name="plateNumber" label={t('becomeDriver.plateNumber')} placeholder={t('becomeDriver.plateNumberPlaceholder')} required />

                    <Button type="submit" className="w-full" isLoading={isLoading}>{t('becomeDriver.submit')}</Button>
                </form>
            </Card>
        </div>
    );
}
