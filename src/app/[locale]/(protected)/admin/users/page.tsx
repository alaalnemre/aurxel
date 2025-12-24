import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Store, Truck, Shield, Search } from 'lucide-react';

interface AdminUsersPageProps {
    params: Promise<{ locale: string }>;
}

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();

    // Get all profiles with counts
    const { data: profiles, count: totalCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);

    // Counts by role
    const buyerCount = profiles?.filter(p => p.role === 'buyer').length || 0;
    const sellerCount = profiles?.filter(p => p.role === 'seller').length || 0;
    const driverCount = profiles?.filter(p => p.role === 'driver').length || 0;
    const adminCount = profiles?.filter(p => p.role === 'admin').length || 0;

    const t = {
        title: locale === 'ar' ? 'المستخدمين' : 'Users',
        search: locale === 'ar' ? 'بحث عن مستخدم...' : 'Search users...',
        total: locale === 'ar' ? 'الإجمالي' : 'Total',
        buyers: locale === 'ar' ? 'المشترين' : 'Buyers',
        sellers: locale === 'ar' ? 'البائعين' : 'Sellers',
        drivers: locale === 'ar' ? 'السائقين' : 'Drivers',
        admins: locale === 'ar' ? 'المشرفين' : 'Admins',
        noUsers: locale === 'ar' ? 'لا يوجد مستخدمين' : 'No users',
        joinedOn: locale === 'ar' ? 'انضم في' : 'Joined',
    };

    const roleIcons = {
        buyer: Users,
        seller: Store,
        driver: Truck,
        admin: Shield,
    };

    const roleBadges = {
        buyer: 'secondary',
        seller: 'default',
        driver: 'outline',
        admin: 'destructive',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold">{t.title}</h1>
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t.search} className="pl-10" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t.total}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {t.buyers}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{buyerCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            {t.sellers}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sellerCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            {t.drivers}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driverCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {t.admins}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Users List */}
            <Card>
                <CardContent className="p-0">
                    {!profiles || profiles.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            {t.noUsers}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {profiles.map((profile) => {
                                const RoleIcon = roleIcons[profile.role as keyof typeof roleIcons] || Users;
                                return (
                                    <div key={profile.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                <RoleIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{profile.full_name || 'No name'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t.joinedOn} {new Date(profile.created_at).toLocaleDateString(locale)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={roleBadges[profile.role as keyof typeof roleBadges] as 'default' | 'secondary' | 'destructive' | 'outline'}>
                                            {profile.role}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
