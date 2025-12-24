'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Globe, LogOut, Settings, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
    locale: string;
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    notificationCount?: number;
}

export function Header({ locale, user, notificationCount = 0 }: HeaderProps) {
    const isRTL = locale === 'ar';

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
            {/* Spacer for mobile menu button */}
            <div className="w-10 md:hidden" />

            {/* Title - can be customized per page */}
            <div className="flex-1">
                <h1 className="text-lg font-semibold md:text-xl">
                    {/* Page title goes here via props or context */}
                </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Globe className="h-5 w-5" />
                            <span className="sr-only">Switch language</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                        <DropdownMenuItem asChild>
                            <Link href={`/en`} className="flex items-center gap-2">
                                <span className="text-base">🇺🇸</span>
                                <span>English</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/ar`} className="flex items-center gap-2">
                                <span className="text-base">🇯🇴</span>
                                <span>العربية</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* User Menu */}
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>
                                        {user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/${locale}/settings`} className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{locale === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/${locale}/settings`} className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    <span>{locale === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <LogOut className="h-4 w-4 mr-2" />
                                <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button asChild size="sm">
                        <Link href={`/${locale}/login`}>
                            {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                        </Link>
                    </Button>
                )}
            </div>
        </header>
    );
}
