'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toggleProductActive, deleteProduct } from '@/actions/seller';
import { Power, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductActionsProps {
    productId: string;
    isActive: boolean;
    locale: string;
}

export function ProductActions({ productId, isActive, locale }: ProductActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const t = {
        activate: locale === 'ar' ? 'تفعيل' : 'Activate',
        deactivate: locale === 'ar' ? 'إيقاف' : 'Deactivate',
        delete: locale === 'ar' ? 'حذف' : 'Delete',
    };

    const handleToggle = () => {
        startTransition(async () => {
            await toggleProductActive(productId);
            router.refresh();
        });
    };

    const handleDelete = () => {
        if (!confirm(locale === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;

        startTransition(async () => {
            await deleteProduct(productId);
            router.refresh();
        });
    };

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant="outline"
                onClick={handleToggle}
                disabled={isPending}
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <Power className="h-4 w-4 mr-1" />
                        {isActive ? t.deactivate : t.activate}
                    </>
                )}
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
