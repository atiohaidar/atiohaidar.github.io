import React from 'react';
import type { ArticleFormState, DashboardPalette } from './types';

interface ArticleModalState {
    isOpen: boolean;
    isEditing: boolean;
    error: string;
    formState: ArticleFormState;
    isSubmitting: boolean;
}

interface ArticleModalProps {
    palette: DashboardPalette;
    modalState: ArticleModalState;
    onClose: () => void;
    onSubmit: (event: React.FormEvent) => void;
    onChange: (updates: Partial<ArticleFormState>) => void;
}

export function ArticleModal({ palette, modalState, onClose, onSubmit, onChange }: ArticleModalProps) {
    if (!modalState.isOpen) {
        return null;
    }

    const { isEditing, error, formState, isSubmitting } = modalState;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${palette.panel.bg} ${palette.panel.border} max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg`}>
                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <h3 className={`text-xl font-semibold ${palette.panel.text}`}>
                            {isEditing ? 'Edit Article' : 'Buat Article Baru'}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-3 py-1 rounded text-sm transition-colors ${palette.buttons.secondary}`}
                        >
                            ✕
                        </button>
                    </div>

                    {error && (
                        <div className="rounded border border-status-danger/40 bg-status-danger-muted px-4 py-3 text-sm text-status-danger-dark">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        {!isEditing && (
                            <div className="space-y-2">
                                <label className={`block text-sm ${palette.panel.textMuted}`}>
                                    Slug <span className="text-status-danger">*</span>
                                </label>
                                <input
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
                            <label className={`block text-sm ${palette.panel.textMuted}`}>
                                Title <span className="text-status-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={formState.title}
                                onChange={(event) => onChange({ title: event.target.value })}
                                className={`w-full px-4 py-2 rounded-lg ${palette.input}`}
                                placeholder="Judul artikel"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={`block text-sm ${palette.panel.textMuted}`}>
                                Content <span className="text-status-danger">*</span>
                            </label>
                            <textarea
                                value={formState.content}
                                onChange={(event) => onChange({ content: event.target.value })}
                                className={`w-full px-4 py-2 rounded-lg min-h-[200px] ${palette.input}`}
                                placeholder="Konten artikel (mendukung Markdown)"
                                required
                            />
                        </div>

                        <label className={`flex items-center gap-2 text-sm ${palette.panel.textMuted}`}>
                            <input
                                type="checkbox"
                                id="published"
                                checked={formState.published}
                                onChange={(event) => onChange({ published: event.target.checked })}
                                className="h-4 w-4 rounded border border-status-info/40 bg-transparent text-accent-blue focus:ring-status-info"
                            />
                            <span>Publish artikel (tampilkan ke publik)</span>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${palette.buttons.success} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Article' : 'Buat Article'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${palette.buttons.secondary}`}
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
