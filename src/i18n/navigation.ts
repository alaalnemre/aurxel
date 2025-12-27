// src/i18n/navigation.ts
// Type-safe navigation helpers for next-intl

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
