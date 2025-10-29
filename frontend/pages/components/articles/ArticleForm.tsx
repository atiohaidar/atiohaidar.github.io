import React from 'react';
import type { ArticleFormState, DashboardPalette } from './types';

interface ArticleFormProps {
    palette: DashboardPalette;
    formState: ArticleFormState;
    isEditing: boolean;
    isSubmitting: boolean;
    error?: string;
    onChange: (updates: Partial<ArticleFormState>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export function ArticleForm({
    palette,
    formState,
    isEditing,
    isSubmitting,
    error,
    onChange,
    onSubmit,
    onCancel,
}: ArticleFormProps) {
    return (
        <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6 max-w-4xl mx-auto`}>
            <div className="space-y-6">
                <div>
                    <h1 className={`text-2xl font-semibold ${palette.panel.text}`}>
                        {isEditing ? 'Edit Article' : 'Buat Article Baru'}
                    </h1>
                    <p className={`text-sm mt-2 ${palette.panel.textMuted}`}>
                        Pastikan konten artikel Anda sudah lengkap sebelum dipublikasikan.
                    </p>
                </div>

                {error ? (
                    <div className="rounded border border-status-danger/40 bg-status-danger-muted px-4 py-3 text-sm text-status-danger-dark">
                        {error}
                    </div>
                ) : null}

                <form onSubmit={onSubmit} className="space-y-5">
                    {!isEditing && (
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${palette.panel.text}`} htmlFor="slug">
                                Slug <span className="text-status-danger">*</span>
                            </label>
                            <input
                                id="slug"
                                type="text"
                                value={formState.slug}
                                onChange={(event) => onChange({ slug: event.target.value })}
                                className={`w-full px-4 py-2 rounded-lg ${palette.input}`}
                                placeholder="contoh: my-first-article"
                                required
                            />
                            <p className={`text-xs ${palette.panel.textMuted}`}>
                                URL-friendly identifier (tidak bisa diubah setelah dibuat)
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className={`block text-sm font-medium ${palette.panel.text}`} htmlFor="title">
                            Judul <span className="text-status-danger">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formState.title}
                            onChange={(event) => onChange({ title: event.target.value })}
                            className={`w-full px-4 py-2 rounded-lg ${palette.input}`}
                            placeholder="Judul artikel"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={`block text-sm font-medium ${palette.panel.text}`} htmlFor="content">
                            Konten <span className="text-status-danger">*</span>
                        </label>
                        <textarea
                            id="content"
                            value={formState.content}
                            onChange={(event) => onChange({ content: event.target.value })}
                            className={`w-full px-4 py-3 rounded-lg min-h-[280px] ${palette.input}`}
                            placeholder="Konten artikel (mendukung Markdown)"
                            required
                        />
                    </div>

                    <label className={`flex items-center gap-2 text-sm ${palette.panel.text}`} htmlFor="published">
                        <input
                            id="published"
                            type="checkbox"
                            checked={formState.published}
                            onChange={(event) => onChange({ published: event.target.checked })}
                            className="h-4 w-4 rounded border border-status-info/40 bg-transparent text-accent-blue focus:ring-status-info"
                        />
                        <span className={palette.panel.textMuted}>
                            Publish artikel (tampilkan ke publik)
                        </span>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${palette.buttons.success} disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Article' : 'Buat Article'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${palette.buttons.secondary}`}
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
