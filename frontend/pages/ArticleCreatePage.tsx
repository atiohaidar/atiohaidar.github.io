import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { createArticle } from '../apiService';
import type { ArticleCreate } from '../apiTypes';
import { useTheme } from '../contexts/ThemeContext';
import { DASHBOARD_THEME } from '../utils/styles';
import { DEFAULT_ARTICLE_FORM_STATE, type ArticleFormState } from './components/articles/types';
import { ArticleForm } from './components/articles/ArticleForm';

const ArticleCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const palette = useMemo(() => DASHBOARD_THEME[theme], [theme]);

    const [formState, setFormState] = useState<ArticleFormState>(DEFAULT_ARTICLE_FORM_STATE);
    const [error, setError] = useState('');

    const createMutation = useMutation({
        mutationFn: (payload: ArticleCreate) => createArticle(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            navigate('/dashboard/articles');
        },
        onError: (err: Error) => setError(err.message || 'Gagal membuat artikel'),
    });

    const handleChange = (updates: Partial<ArticleFormState>) => {
        setFormState((prev) => ({ ...prev, ...updates }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!formState.slug.trim()) {
            setError('Slug harus diisi');
            return;
        }

        if (!formState.title.trim() || !formState.content.trim()) {
            setError('Title dan content harus diisi');
            return;
        }

        const payload: ArticleCreate = {
            slug: formState.slug,
            title: formState.title,
            content: formState.content,
            published: formState.published,
        };

        createMutation.mutate(payload);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <ArticleForm
                palette={palette}
                formState={formState}
                isEditing={false}
                isSubmitting={createMutation.isPending}
                error={error}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/dashboard/articles')}
            />
        </div>
    );
};

export default ArticleCreatePage;
