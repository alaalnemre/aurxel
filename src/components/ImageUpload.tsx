'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/actions/upload';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    currentImage?: string;
}

export function ImageUpload({ onUploadComplete, currentImage }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImage(formData);
            onUploadComplete(result.url);
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
            setPreview(currentImage || null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Product Image</label>

            {/* Image Preview */}
            {preview && (
                <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border-2 border-border">
                    <img
                        src={preview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                                <p>Uploading...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-3">
                <label className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer text-center">
                    {preview ? 'Change Image' : 'Upload Image'}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
                {preview && (
                    <button
                        type="button"
                        onClick={() => {
                            setPreview(null);
                            onUploadComplete('');
                        }}
                        className="px-4 py-2 border border-error text-error font-semibold rounded-lg hover:bg-error/10 transition-colors"
                    >
                        Remove
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
                    {error}
                </div>
            )}

            {/* Upload Info */}
            <p className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG, WebP. Max size: 5MB
            </p>
        </div>
    );
}
