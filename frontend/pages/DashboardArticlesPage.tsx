import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { COLORS } from '../utils/styles';
import { createArticle, deleteArticle, listArticles, updateArticle } from '../apiService';
import type { Article, ArticleCreate, ArticleUpdate } from '../apiTypes';

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
                <h2 className="text-xl font-semibold text-white mb-2">Kelola Articles</h2>
                <p className="text-soft-gray text-sm">
                    Buat dan kelola artikel blog atau konten Anda
                </p>
            </div>

            <div className="bg-navy-darker rounded-lg border border-light-slate/20 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Daftar Articles</h3>
                    <button
                        onClick={() => openModal()}
                        className={`px-4 py-2 ${COLORS.BG_ACCENT} text-white rounded-lg hover:bg-accent-blue/80 transition-colors`}
                        disabled={createMutation.isPending}
                    >
                        + Buat Article Baru
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-soft-gray">Memuat articles...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-soft-gray">Belum ada article. Buat yang pertama!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {articles.map((article) => (
                            <div
                                key={article.slug}
                                className="bg-navy-light p-4 rounded-lg border border-light-slate/10 hover:border-accent-blue/30 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium mb-1">{article.title}</h4>
                                        <p className="text-soft-gray text-sm mb-2">Slug: {article.slug}</p>
                                        <p className="text-soft-gray text-sm line-clamp-2 mb-2">
                                            {article.content.substring(0, 150)}
                                            {article.content.length > 150 ? '...' : ''}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded ${
                                                    article.published
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                            >
                                                {article.published ? 'Published' : 'Draft'}
                                            </span>
                                            {article.created_at && (
                                                <span className="text-xs text-soft-gray">
                                                    Dibuat: {new Date(article.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => togglePublished(article)}
                                            className="px-3 py-1 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                            disabled={updateMutation.isPending}
                                            title={article.published ? 'Unpublish' : 'Publish'}
                                        >
                                            {article.published ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                        <button
                                            onClick={() => openModal(article)}
                                            className="px-3 py-1 text-accent-blue hover:bg-accent-blue/10 rounded transition-colors"
                                            disabled={updateMutation.isPending}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article.slug, article.title)}
                                            className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
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

            {/* Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-light-navy rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                {editingArticle ? 'Edit Article' : 'Buat Article Baru'}
                            </h3>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!editingArticle && (
                                    <div>
                                        <label className="block text-soft-gray text-sm mb-2">
                                            Slug <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                setFormData({ ...formData, slug: e.target.value })
                                            }
                                            className="w-full bg-deep-navy border border-light-slate/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-blue"
                                            placeholder="contoh: my-first-article"
                                            required
                                        />
                                        <p className="text-xs text-soft-gray mt-1">
                                            URL-friendly identifier (tidak bisa diubah setelah dibuat)
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-soft-gray text-sm mb-2">
                                        Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        className="w-full bg-deep-navy border border-light-slate/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-blue"
                                        placeholder="Judul artikel"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-soft-gray text-sm mb-2">
                                        Content <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData({ ...formData, content: e.target.value })
                                        }
                                        className="w-full bg-deep-navy border border-light-slate/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-blue min-h-[200px]"
                                        placeholder="Konten artikel (mendukung Markdown)"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="published"
                                        checked={formData.published}
                                        onChange={(e) =>
                                            setFormData({ ...formData, published: e.target.checked })
                                        }
                                        className="mr-2"
                                    />
                                    <label htmlFor="published" className="text-soft-gray text-sm">
                                        Publish artikel (tampilkan ke publik)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className={`flex-1 ${COLORS.BG_ACCENT} text-white py-2 rounded-lg hover:bg-accent-blue/80 transition-colors disabled:opacity-50`}
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
                                        className="flex-1 bg-soft-gray/20 text-soft-gray py-2 rounded-lg hover:bg-soft-gray/30 transition-colors"
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
