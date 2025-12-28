'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/StatusBadge';
import { updateProfile } from '@/actions/profile';
import { createClient } from '@/lib/supabase/client';

const CITIES = ['amman', 'zarqa', 'irbid', 'aqaba', 'madaba', 'jerash', 'salt', 'karak'];

export default function ProfilePage() {
    const t = useTranslations();
    const [profile, setProfile] = useState<{ full_name: string | null; phone: string | null; city: string | null; address: string | null } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name, phone, city, address').eq('id', user.id).maybeSingle();
                setProfile(data);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const formData = new FormData(e.currentTarget);
        const result = await updateProfile(formData);

        setMessage(result.success ? t('profile.profileUpdated') : (result.error || 'Failed'));
        setIsLoading(false);
    };

    if (!profile) return null;

    return (
        <div className="max-w-xl mx-auto">
            <PageHeader title={t('profile.title')} />

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.includes('success') || message.includes(t('profile.profileUpdated')) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {message}
                        </div>
                    )}

                    <Input name="fullName" label={t('profile.fullName')} defaultValue={profile.full_name || ''} />
                    <Input name="phone" label={t('profile.phone')} defaultValue={profile.phone || ''} />
                    <Select name="city" label={t('profile.city')} defaultValue={profile.city || ''} options={[{ value: '', label: '' }, ...CITIES.map(c => ({ value: t(`cities.${c}`), label: t(`cities.${c}`) }))]} />
                    <Input name="address" label={t('profile.address')} defaultValue={profile.address || ''} />

                    <Button type="submit" className="w-full" isLoading={isLoading}>{t('profile.updateProfile')}</Button>
                </form>
            </Card>
        </div>
    );
}
