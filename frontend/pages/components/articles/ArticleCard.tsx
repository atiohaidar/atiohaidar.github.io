import React from 'react';
import type { Article } from '../../../apiTypes';
import type { DashboardPalette } from './types';

type ArticleCardProps = {
    article: Article;
    palette: DashboardPalette;
    onTogglePublished: (article: Article) => void;
    onEdit: (article: Article) => void;
    onDelete: (slug: string, title: string) => void;
    updatePending: boolean;
    deletePending: boolean;
};

export function ArticleCard({
    article,
    palette,
    onTogglePublished,
    onEdit,
    onDelete,
    updatePending,
    deletePending,
}: ArticleCardProps) {
    const publishedBadgeClass = article.published
        ? palette.badges.success
        : palette.badges.warning;

    return (
        <div
            className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-4 hover:border-accent-blue/30 transition-colors`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                    <h4 className={`font-medium ${palette.panel.text}`}>{article.title}</h4>
                    <p className={`${palette.panel.textMuted} text-sm`}>Slug: {article.slug}</p>
                    <p className={`${palette.panel.textMuted} text-sm line-clamp-2`}>
                        {article.content.substring(0, 150)}
                        {article.content.length > 150 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs rounded ${publishedBadgeClass}`}>
                            {article.published ? 'Published' : 'Draft'}
                        </span>
                        {article.created_at && (
                            <span className={`text-xs ${palette.panel.textMuted}`}>
                                Dibuat: {new Date(article.created_at).toLocaleDateString('id-ID')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => onTogglePublished(article)}
                        className={`px-3 py-2 rounded text-sm transition-colors ${palette.buttons.info}`}
                        disabled={updatePending}
                        title={article.published ? 'Unpublish' : 'Publish'}
                    >
                        {article.published ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button
                        onClick={() => onEdit(article)}
                        className={`px-3 py-2 rounded text-sm transition-colors ${palette.buttons.primary}`}
                        disabled={updatePending}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(article.slug, article.title)}
                        className={`px-3 py-2 rounded text-sm transition-colors ${palette.buttons.danger}`}
                        disabled={deletePending}
                    >
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}
