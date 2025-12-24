import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

interface UnauthorizedPageProps {
    params: Promise<{ locale: string }>;
}

export default async function UnauthorizedPage({ params }: UnauthorizedPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <CardTitle>
                        {locale === 'ar' ? 'غير مصرح' : 'Unauthorized'}
                    </CardTitle>
                    <CardDescription>
                        {locale === 'ar'
                            ? 'ليس لديك الصلاحية للوصول إلى هذه الصفحة'
                            : 'You do not have permission to access this page'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Link href={`/${locale}`}>
                        <Button className="w-full">
                            {locale === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
