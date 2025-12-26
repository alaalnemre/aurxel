'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface Category {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
}

interface Filters {
    q?: string;
    category?: string;
    min?: string;
    max?: string;
    sort?: string;
}

export function ProductFilters({
    locale,
    categories,
    currentFilters,
}: {
    locale: string;
    categories: Category[];
    currentFilters: Filters;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(currentFilters.q || '');

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilter('q', search);
    };

    const clearFilters = () => {
        router.push(pathname);
        setSearch('');
    };

    const hasActiveFilters = currentFilters.q || currentFilters.category || currentFilters.min || currentFilters.max;

    return (
        <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={locale === 'ar' ? 'ابحث عن منتجات...' : 'Search products...'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${showFilters || hasActiveFilters
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-secondary hover:border-primary'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="hidden sm:inline">
                        {locale === 'ar' ? 'فلترة' : 'Filter'}
                    </span>
                </button>
            </form>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-card rounded-xl p-4 shadow-card animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category */}
                        <div>
                            <label className="text-sm font-medium text-secondary mb-1.5 block">
                                {locale === 'ar' ? 'الفئة' : 'Category'}
                            </label>
                            <select
                                value={currentFilters.category || ''}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none"
                            >
                                <option value="">{locale === 'ar' ? 'الكل' : 'All'}</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {locale === 'ar' ? cat.name_ar : cat.name_en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Price */}
                        <div>
                            <label className="text-sm font-medium text-secondary mb-1.5 block">
                                {locale === 'ar' ? 'السعر من' : 'Min Price'}
                            </label>
                            <input
                                type="number"
                                value={currentFilters.min || ''}
                                onChange={(e) => updateFilter('min', e.target.value)}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        {/* Max Price */}
                        <div>
                            <label className="text-sm font-medium text-secondary mb-1.5 block">
                                {locale === 'ar' ? 'السعر إلى' : 'Max Price'}
                            </label>
                            <input
                                type="number"
                                value={currentFilters.max || ''}
                                onChange={(e) => updateFilter('max', e.target.value)}
                                placeholder="1000"
                                min="0"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none"
                            />
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-sm font-medium text-secondary mb-1.5 block">
                                {locale === 'ar' ? 'ترتيب' : 'Sort by'}
                            </label>
                            <select
                                value={currentFilters.sort || ''}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none"
                            >
                                <option value="newest">{locale === 'ar' ? 'الأحدث' : 'Newest'}</option>
                                <option value="price_asc">{locale === 'ar' ? 'السعر: الأقل' : 'Price: Low to High'}</option>
                                <option value="price_desc">{locale === 'ar' ? 'السعر: الأعلى' : 'Price: High to Low'}</option>
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-sm text-error hover:underline"
                        >
                            {locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
