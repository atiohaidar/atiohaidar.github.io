import React from 'react';
import type { Article } from '../../../apiTypes';
import type { DashboardPalette } from './types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
    articles: Article[];
    palette: DashboardPalette;
    isLoading: boolean;
    onCreateClick: () => void;
    onEdit: (article: Article) => void;
    onDelete: (slug: string, title: string) => void;
    onTogglePublished: (article: Article) => void;
    createDisabled?: boolean;
    updatePending: boolean;
    deletePending: boolean;
}

export function ArticleList({
    articles,
    palette,
    isLoading,
    onCreateClick,
    onEdit,
    onDelete,
    onTogglePublished,
    createDisabled = false,
    updatePending,
    deletePending,
}: ArticleListProps) {
    return (
        <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6 space-y-6`}>
            <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${palette.panel.text}`}>Daftar Articles</h3>
                <button
                    onClick={onCreateClick}
                    type="button"
                    className={`px-4 py-2 rounded-lg transition-colors ${palette.buttons.info}`}
                    disabled={createDisabled}
                >
                    + Buat Article Baru
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <p className={palette.panel.textMuted}>Memuat articles...</p>
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-12">
                    <p className={palette.panel.textMuted}>Belum ada article. Buat yang pertama!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {articles.map((article) => (
                        <ArticleCard
                            key={article.slug}
                            article={article}
                            palette={palette}
                            onTogglePublished={onTogglePublished}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            updatePending={updatePending}
                            deletePending={deletePending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
