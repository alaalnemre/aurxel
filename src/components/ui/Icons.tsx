'use client';

/**
 * Icon System - JordanMarket
 * Using Lucide React for consistent, professional iconography
 * All icons are tree-shaking friendly with explicit imports
 */

import {
    ShoppingCart,
    Package,
    Wallet,
    Truck,
    Users,
    Store,
    Settings,
    ClipboardList,
    DollarSign,
    LayoutDashboard,
    Bike,
    Gem,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    ShoppingBag,
    Star,
    ChefHat,
    MapPin,
    CreditCard,
    Shield,
    TrendingUp,
    Calendar,
    Sun,
    Moon,
    Monitor,
    Globe,
    ChevronRight,
    ChevronLeft,
    Plus,
    Minus,
    Trash2,
    Edit,
    Eye,
    Search,
    Filter,
    Menu,
    X,
    Home,
    User,
    LogOut,
    Bell,
    Heart,
    Share2,
    Download,
    Upload,
    Image as ImageIcon,
    FileText,
    Tag,
    Percent,
    Award,
    Zap,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    CheckCheck,
    Circle,
    ExternalLink,
} from 'lucide-react';
import { forwardRef, type SVGProps } from 'react';

// Re-export all icons for easy importing
export {
    ShoppingCart,
    Package,
    Wallet,
    Truck,
    Users,
    Store,
    Settings,
    ClipboardList,
    DollarSign,
    LayoutDashboard,
    Bike,
    Gem,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    ShoppingBag,
    Star,
    ChefHat,
    MapPin,
    CreditCard,
    Shield,
    TrendingUp,
    Calendar,
    Sun,
    Moon,
    Monitor,
    Globe,
    ChevronRight,
    ChevronLeft,
    Plus,
    Minus,
    Trash2,
    Edit,
    Eye,
    Search,
    Filter,
    Menu,
    X,
    Home,
    User,
    LogOut,
    Bell,
    Heart,
    Share2,
    Download,
    Upload,
    ImageIcon,
    FileText,
    Tag,
    Percent,
    Award,
    Zap,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    CheckCheck,
    Circle,
    ExternalLink,
};

// Icon size presets for consistency
export const ICON_SIZES = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// Common icon props type
export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: IconSize | number;
    className?: string;
}

// Helper to get pixel size
export function getIconSize(size: IconSize | number): number {
    if (typeof size === 'number') return size;
    return ICON_SIZES[size];
}

// Icon mapping for dynamic icon rendering (used in navigation, etc.)
export const iconMap = {
    // Navigation
    home: Home,
    dashboard: LayoutDashboard,
    cart: ShoppingCart,
    orders: Package,
    wallet: Wallet,
    shop: ShoppingBag,
    products: Package,
    settings: Settings,
    users: Users,
    store: Store,
    sellers: Store,
    drivers: Bike,
    truck: Truck,
    deliveries: Truck,
    earnings: DollarSign,
    payouts: DollarSign,
    qanz: Gem,
    clipboard: ClipboardList,

    // Status
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    pending: Clock,

    // Actions
    add: Plus,
    remove: Minus,
    delete: Trash2,
    edit: Edit,
    view: Eye,
    search: Search,
    filter: Filter,
    menu: Menu,
    close: X,
    refresh: RefreshCw,

    // Theme
    sun: Sun,
    moon: Moon,
    system: Monitor,
    globe: Globe,

    // Misc
    star: Star,
    heart: Heart,
    share: Share2,
    download: Download,
    upload: Upload,
    image: ImageIcon,
    file: FileText,
    tag: Tag,
    percent: Percent,
    award: Award,
    zap: Zap,
    sparkle: Sparkles,
    shield: Shield,
    credit: CreditCard,
    location: MapPin,
    chef: ChefHat,
    trending: TrendingUp,
    calendar: Calendar,
    user: User,
    logout: LogOut,
    bell: Bell,
    check: CheckCircle,
    chevronRight: ChevronRight,
    chevronLeft: ChevronLeft,
    arrowRight: ArrowRight,
    arrowLeft: ArrowLeft,
    external: ExternalLink,
} as const;

export type IconName = keyof typeof iconMap;

// Dynamic icon component
interface DynamicIconProps extends IconProps {
    name: IconName;
}

export const Icon = forwardRef<SVGSVGElement, DynamicIconProps>(
    ({ name, size = 'md', className = '', ...props }, ref) => {
        const IconComponent = iconMap[name];
        if (!IconComponent) return null;

        const pixelSize = getIconSize(size);

        return (
            <IconComponent
                ref={ref}
                width={pixelSize}
                height={pixelSize}
                className={className}
                {...props}
            />
        );
    }
);

Icon.displayName = 'Icon';

// Pre-sized icon components for common use cases
export const NavIcon = forwardRef<SVGSVGElement, Omit<DynamicIconProps, 'size'>>(
    (props, ref) => <Icon ref={ref} size="md" {...props} />
);
NavIcon.displayName = 'NavIcon';

export const ButtonIcon = forwardRef<SVGSVGElement, Omit<DynamicIconProps, 'size'>>(
    (props, ref) => <Icon ref={ref} size="sm" {...props} />
);
ButtonIcon.displayName = 'ButtonIcon';

export const StatIcon = forwardRef<SVGSVGElement, Omit<DynamicIconProps, 'size'>>(
    (props, ref) => <Icon ref={ref} size="xl" {...props} />
);
StatIcon.displayName = 'StatIcon';
