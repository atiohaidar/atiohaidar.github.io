import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { COLORS, DASHBOARD_THEME } from '../utils/styles';
import { createArticle, deleteArticle, listArticles, updateArticle } from '../apiService';
import type { Article, ArticleCreate, ArticleUpdate } from '../apiTypes';
import { useTheme } from '../contexts/ThemeContext';

interface ArticleFormData {
    slug: string;
    title: string;
    content: string;
    published: boolean;
}

const DashboardArticlesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState<ArticleFormData>({
        slug: '',
        title: '',
        content: '',
        published: false,
    });
    const [error, setError] = useState<string>('');
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];

    // Fetch articles
    const { data: articles = [], isLoading, refetch } = useQuery({
        queryKey: ['articles'],
        queryFn: () => listArticles({ page: 0 }),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (newArticle: ArticleCreate) => createArticle(newArticle),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            closeModal();
        },
        onError: (error: Error) => {
            setError(error.message || 'Gagal membuat artikel');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ slug, updates }: { slug: string; updates: ArticleUpdate }) =>
            updateArticle(slug, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            closeModal();
        },
        onError: (error: Error) => {
            setError(error.message || 'Gagal mengupdate artikel');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (slug: string) => deleteArticle(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        },
        onError: (error: Error) => {
            alert(error.message || 'Gagal menghapus artikel');
        },
    });

    const openModal = (article?: Article) => {
        if (article) {
            setEditingArticle(article);
            setFormData({
                slug: article.slug,
                title: article.title,
                content: article.content,
                published: article.published,
            });
        } else {
            setEditingArticle(null);
            setFormData({
                slug: '',
                title: '',
                content: '',
                published: false,
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingArticle(null);
        setFormData({
            slug: '',
            title: '',
            content: '',
            published: false,
        });
        setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title dan content harus diisi');
            return;
        }

        if (editingArticle) {
            // Update article
            const updates: ArticleUpdate = {
                title: formData.title,
                content: formData.content,
                published: formData.published,
            };
            updateMutation.mutate({ slug: editingArticle.slug, updates });
        } else {
            // Create new article
            if (!formData.slug.trim()) {
                setError('Slug harus diisi');
                return;
            }
            const newArticle: ArticleCreate = {
                slug: formData.slug,
                title: formData.title,
                content: formData.content,
                published: formData.published,
            };
            createMutation.mutate(newArticle);
        }
    };

    const handleDelete = (slug: string, title: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) {
            deleteMutation.mutate(slug);
        }
    };

    const togglePublished = (article: Article) => {
        updateMutation.mutate({
            slug: article.slug,
            updates: { published: !article.published },
        });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className={`text-xl font-semibold mb-2 ${palette.panel.text}`}>Kelola Articles</h2>
                <p className={`text-sm ${palette.panel.textMuted}`}>
                    Buat dan kelola artikel blog atau konten Anda
                </p>
            </div>

            <div className={`${palette.panel.bg} ${palette.panel.border} rounded-lg p-6 space-y-6`}>
                <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-semibold ${palette.panel.text}`}>Daftar Articles</h3>
                    <button
                        onClick={() => openModal()}
                        className={`px-4 py-2 rounded-lg transition-colors ${palette.buttons.info}`}
                        disabled={createMutation.isPending}
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
                            <div
                                key={article.slug}
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
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded ${
                                                    article.published ? palette.badges.success : palette.badges.warning
                                                }`}
                                            >
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
                                            onClick={() => togglePublished(article)}
                                            className={`px-3 py-2 rounded text-sm transition-colors ${palette.buttons.info}`}
                                            disabled={updateMutation.isPending}
                                            title={article.published ? 'Unpublish' : 'Publish'}
                                        >
                                            {article.published ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                        <button
                                            onClick={() => openModal(article)}
                                            className={`px-3 py-2 rounded text-sm transition-colors ${palette.buttons.primary}`}
                                            disabled={updateMutation.isPending}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article.slug, article.title)}
                                            className={`px-3 py-2 rounded text-sm transition-colors ${palette.buttons.danger}`}
                                            disabled={deleteMutation.isPending}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`${palette.panel.bg} ${palette.panel.border} max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg`}>
                        <div className="p-6 space-y-6">
                            <div className="flex items-start justify-between">
                                <h3 className={`text-xl font-semibold ${palette.panel.text}`}>
                                    {editingArticle ? 'Edit Article' : 'Buat Article Baru'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={closeModal}
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

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!editingArticle && (
                                    <div className="space-y-2">
                                        <label className={`block text-sm ${palette.panel.textMuted}`}>
                                            Slug <span className="text-status-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                setFormData({ ...formData, slug: e.target.value })
                                            }
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
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
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
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData({ ...formData, content: e.target.value })
                                        }
                                        className={`w-full px-4 py-2 rounded-lg min-h-[200px] ${palette.input}`}
                                        placeholder="Konten artikel (mendukung Markdown)"
                                        required
                                    />
                                </div>

                                <label className={`flex items-center gap-2 text-sm ${palette.panel.textMuted}`}>
                                    <input
                                        type="checkbox"
                                        id="published"
                                        checked={formData.published}
                                        onChange={(e) =>
                                            setFormData({ ...formData, published: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border border-status-info/40 bg-transparent text-accent-blue focus:ring-status-info"
                                    />
                                    <span>Publish artikel (tampilkan ke publik)</span>
                                </label>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${palette.buttons.success} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {createMutation.isPending || updateMutation.isPending
                                            ? 'Menyimpan...'
                                            : editingArticle
                                            ? 'Update Article'
                                            : 'Buat Article'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${palette.buttons.secondary}`}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardArticlesPage;
