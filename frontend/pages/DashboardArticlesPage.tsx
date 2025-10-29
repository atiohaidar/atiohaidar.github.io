import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteArticle, listArticles, updateArticle } from '../apiService';
import type { Article, ArticleUpdate } from '../apiTypes';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';
import { ArticleList } from './components/articles/ArticleList';
import { ArticlesHeader } from './components/articles/ArticlesHeader';

const DashboardArticlesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];

    const { data: articles = [], isLoading } = useQuery({
        queryKey: ['articles'],
        queryFn: () => listArticles({ page: 0 }),
    });

    const invalidateArticles = () =>
        queryClient.invalidateQueries({ queryKey: ['articles'] });

    const updateMutation = useMutation({
        mutationFn: ({ slug, updates }: { slug: string; updates: ArticleUpdate }) =>
            updateArticle(slug, updates),
        onSuccess: invalidateArticles,
        onError: (err: Error) => alert(err.message || 'Gagal mengupdate artikel'),
    });

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => deleteArticle(slug),
        onSuccess: invalidateArticles,
        onError: (err: Error) => alert(err.message || 'Gagal menghapus artikel'),
    });

    const handleDelete = (slug: string, title: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) {
            deleteMutation.mutate(slug);
        }
    };

    const handleTogglePublished = (article: Article) => {
        updateMutation.mutate({
            slug: article.slug,
            updates: { published: !article.published },
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <ArticlesHeader palette={palette} />

            <ArticleList
                articles={articles}
                palette={palette}
                isLoading={isLoading}
                onCreateClick={() => navigate('/dashboard/articles/new')}
                onEdit={(article) => navigate(`/dashboard/articles/${article.slug}/edit`)}
                onDelete={handleDelete}
                onTogglePublished={handleTogglePublished}
                createDisabled={false}
                updatePending={updateMutation.isPending}
                deletePending={deleteMutation.isPending}
            />
        </div>
    );
};

export default DashboardArticlesPage;
