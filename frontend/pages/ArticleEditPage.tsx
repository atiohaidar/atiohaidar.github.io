import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { getArticle, updateArticle } from '../apiService';
import type { ArticleUpdate } from '../apiTypes';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';
import { DEFAULT_ARTICLE_FORM_STATE, type ArticleFormState } from './components/articles/types';
import { ArticleForm } from './components/articles/ArticleForm';

const ArticleEditPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { slug = '' } = useParams<{ slug: string }>();
    const { theme } = useTheme();
    const palette = useMemo(() => DASHBOARD_THEME[theme], [theme]);

    const [formState, setFormState] = useState<ArticleFormState>(DEFAULT_ARTICLE_FORM_STATE);
    const [error, setError] = useState('');

    const { data: article, isLoading } = useQuery({
        queryKey: ['article-detail', slug],
        queryFn: () => getArticle(slug),
        enabled: Boolean(slug),
    });

    useEffect(() => {
        if (article) {
            setFormState({
                slug: article.slug,
                title: article.title,
                content: article.content,
                published: article.published,
            });
        }
    }, [article]);

    const updateMutation = useMutation({
        mutationFn: (payload: { slug: string; updates: ArticleUpdate }) => updateArticle(payload.slug, payload.updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['article-detail', slug] });
            navigate('/dashboard/articles');
        },
        onError: (err: Error) => setError(err.message || 'Gagal mengupdate artikel'),
    });

    const handleChange = (updates: Partial<ArticleFormState>) => {
        setFormState((prev) => ({ ...prev, ...updates }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!formState.title.trim() || !formState.content.trim()) {
            setError('Title dan content harus diisi');
            return;
        }

        updateMutation.mutate({
            slug,
            updates: {
                title: formState.title,
                content: formState.content,
                published: formState.published,
            },
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {isLoading ? (
                <div className={`p-6 rounded-lg text-center ${palette.panel.bg} ${palette.panel.border}`}>
                    <p className={palette.panel.textMuted}>Memuat data artikel...</p>
                </div>
            ) : (
                <ArticleForm
                    palette={palette}
                    formState={formState}
                    isEditing
                    isSubmitting={updateMutation.isPending}
                    error={error}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/dashboard/articles')}
                />
            )}
        </div>
    );
};

export default ArticleEditPage;
