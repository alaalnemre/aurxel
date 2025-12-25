'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Category } from '@/lib/types/database';
import { createCategory, updateCategory, deleteCategory } from '@/lib/admin/actions';

interface CategoryManagerProps {
    categories: Category[];
    locale: string;
}

export function CategoryManager({ categories, locale }: CategoryManagerProps) {
    const t = useTranslations();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setLoading(true);

        const result = editingCategory
            ? await updateCategory(editingCategory.id, formData)
            : await createCategory(formData);

        if (result.success) {
            setShowForm(false);
            setEditingCategory(null);
        } else {
            setError(result.error || 'Failed to save category');
        }
        setLoading(false);
    }

    async function handleDelete(categoryId: string) {
        if (!confirm(t('common.confirmDelete'))) return;

        const result = await deleteCategory(categoryId);
        if (!result.success) {
            alert(result.error || 'Failed to delete category');
        }
    }

    function openEditForm(category: Category) {
        setEditingCategory(category);
        setShowForm(true);
        setError(null);
    }

    function closeForm() {
        setShowForm(false);
        setEditingCategory(null);
        setError(null);
    }

    return (
        <div className="space-y-6">
            {/* Add Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingCategory(null);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    {t('admin.addCategory')}
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingCategory ? t('admin.editCategory') : t('admin.addCategory')}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form action={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('admin.nameEn')} *
                                </label>
                                <input
                                    name="nameEn"
                                    type="text"
                                    required
                                    defaultValue={editingCategory?.name_en || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('admin.nameAr')} *
                                </label>
                                <input
                                    name="nameAr"
                                    type="text"
                                    required
                                    dir="rtl"
                                    defaultValue={editingCategory?.name_ar || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('admin.slug')} *
                                </label>
                                <input
                                    name="slug"
                                    type="text"
                                    required
                                    defaultValue={editingCategory?.slug || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="category-slug"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('admin.icon')}
                                    </label>
                                    <input
                                        name="icon"
                                        type="text"
                                        defaultValue={editingCategory?.icon || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="📦"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('admin.sortOrder')}
                                    </label>
                                    <input
                                        name="sortOrder"
                                        type="number"
                                        defaultValue={editingCategory?.sort_order || 0}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {editingCategory && (
                                <div className="flex items-center gap-2">
                                    <input
                                        name="isActive"
                                        type="checkbox"
                                        defaultChecked={editingCategory.is_active}
                                        value="true"
                                        className="w-4 h-4"
                                    />
                                    <label className="text-sm text-gray-700">{t('admin.active')}</label>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? t('common.loading') : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.icon')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.nameEn')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.nameAr')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.slug')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('admin.status')}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                {t('admin.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-2xl">{category.icon || '📦'}</td>
                                <td className="px-4 py-4 font-medium text-gray-900">
                                    {category.name_en}
                                </td>
                                <td className="px-4 py-4 text-gray-600" dir="rtl">
                                    {category.name_ar}
                                </td>
                                <td className="px-4 py-4">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                        {category.slug}
                                    </code>
                                </td>
                                <td className="px-4 py-4">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${category.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {category.is_active ? t('admin.active') : t('admin.inactive')}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditForm(category)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        {t('common.edit')}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        {t('common.delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {categories.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        {t('admin.noCategoriesFound')}
                    </div>
                )}
            </div>
        </div>
    );
}
