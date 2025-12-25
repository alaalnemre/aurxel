'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="max-w-md w-full">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <FileQuestion className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <Button asChild>
                        <Link href="/">
                            <Home className="h-4 w-4 mr-2" />
                            Go Home
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
