import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { listArticles, getArticle } from '../lib/api';
import { getAuthToken, getStoredUser, clearAuth } from '../lib/api';
import { COLORS, LAYOUT, SPACING } from '../utils/styles';
import type { Article } from '../apiTypes';
import type { Profile } from '../types';
import { getProfile } from '../api';

const EXCERPT_MAX_CHARS = 400;
const EXCERPT_MAX_BLOCKS = 3;

const buildArticleExcerpt = (content: string): string => {
    const normalized = content.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
        return '';
    }

    const blocks = normalized.split('\n\n').filter((block) => block.trim().length > 0);
    const selectedBlocks: string[] = [];
    let charCount = 0;

    for (const block of blocks) {
        selectedBlocks.push(block);
        charCount += block.length;

        if (selectedBlocks.length >= EXCERPT_MAX_BLOCKS || charCount >= EXCERPT_MAX_CHARS) {
            break;
        }
    }

    let excerpt = selectedBlocks.join('\n\n').trim();

    if (blocks.length > selectedBlocks.length || charCount < normalized.length) {
        excerpt = `${excerpt}\n\n…`;
    }

    return excerpt;
};

const renderCodeBlock = (props: any) => {
    const { className, children, inline = false, ...rest } = props ?? {};
    return (
        <code
            className={`${className ?? ''} ${inline ? 'bg-gray-100 dark:bg-light-navy px-1 py-0.5 rounded' : ''}`.trim()}
            {...rest}
        >
            {children}
        </code>
    );
};

const detailComponents: Components = {
    a: ({ node, ...props }) => (
        <a className="text-light-accent dark:text-accent-blue hover:underline" {...props} />
    ),
    code: renderCodeBlock,
};

const listComponents: Components = {
    h1: ({ node, ...props }) => (
        <h3 className="text-xl font-semibold text-light-text dark:text-white" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <h4 className="text-lg font-semibold text-light-text dark:text-white" {...props} />
    ),
    h3: ({ node, ...props }) => (
        <h5 className="text-base font-semibold text-light-text dark:text-white" {...props} />
    ),
    p: ({ node, ...props }) => (
        <p className="text-sm text-light-text dark:text-light-slate" {...props} />
    ),
    a: ({ node, ...props }) => (
        <a className="text-light-accent dark:text-accent-blue hover:underline" {...props} />
    ),
    code: renderCodeBlock,
    ul: ({ node, ...props }) => (
        <ul className="list-disc pl-5 text-sm text-light-text dark:text-light-slate" {...props} />
    ),
    ol: ({ node, ...props }) => (
        <ol className="list-decimal pl-5 text-sm text-light-text dark:text-light-slate" {...props} />
    ),
};

const ArticlesPage: React.FC = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            setLoggedInUser(storedUser.username);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, articlesData] = await Promise.all([
                    getProfile(),
                    listArticles({ page: 0, published: true }), // Only published articles
                ]);
                setProfile(profileData);
                setArticles(articlesData);
            } catch (err) {
                setError('Gagal memuat artikel. Silakan coba lagi nanti.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleLogout = () => {
        clearAuth();
        setLoggedInUser(null);
        navigate('/', { replace: true });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSelectArticle = async (article: Article) => {
        setDetailLoading(true);
        setDetailError(null);
        try {
            const detail = await getArticle(article.slug);
            setSelectedArticle(detail);
        } catch (err) {
            console.error(err);
            setDetailError('Gagal memuat detail artikel.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleBackToList = () => {
        setSelectedArticle(null);
        setDetailError(null);
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${LAYOUT.FLEX_CENTER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_ACCENT} text-xl font-poppins`}>
                Memuat Artikel...
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${LAYOUT.FLEX_CENTER} ${COLORS.BG_PRIMARY} text-red-500 text-xl font-poppins`}>
                {error}
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className={`relative ${COLORS.BG_PRIMARY} transition-colors duration-300`}>
          

            <main className="mx-auto pt-20 md:pt-24 pb-16">
                <div className={`container mx-auto ${SPACING.CONTAINER_PADDING}`}>
                    {/* Header */}
                    <Link to="/dashboard/articles" className={`px-4 py-2 rounded-lg transition-colors ${COLORS.BG_ACCENT} ${COLORS.TEXT_PRIMARY}`}> <span className="text-light-accent dark:text-accent-blue">📰</span> Dashboard Articles</Link>
                    <div className="max-w-4xl mx-auto mb-8 md:mb-12 text-center">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-light-text dark:text-white mb-3 md:mb-4">
                            <span className="text-light-accent dark:text-accent-blue">📰</span> Articles
                        </h1>
                        <p className="text-light-muted dark:text-light-slate text-base md:text-lg px-4">
                            Berbagi pemikiran, pengalaman, dan pembelajaran dalam teknologi dan pengembangan perangkat lunak
                        </p>
                    </div>

                    {/* Articles List */}
                    {articles.length === 0 ? (
                        <div className="max-w-4xl mx-auto text-center py-16">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-light-muted dark:text-light-slate text-xl">
                                Belum ada artikel yang dipublikasikan.
                            </p>
                        </div>
                    ) : selectedArticle ? (
                        /* Article Detail View */
                        <div className="max-w-4xl mx-auto px-2 md:px-0">
                            <button
                                onClick={handleBackToList}
                                className="flex items-center gap-2 text-light-accent dark:text-accent-blue hover:text-light-accent/80 dark:hover:text-accent-blue/80 mb-4 md:mb-6 transition-colors text-sm md:text-base"
                            >
                                ← Kembali ke daftar artikel
                            </button>

                            {detailLoading ? (
                                <div className="bg-white dark:bg-light-navy rounded-xl p-6 md:p-8 border border-gray-300 dark:border-light-slate/20 text-center">
                                    <p className="text-light-muted dark:text-light-slate">Memuat artikel…</p>
                                </div>
                            ) : detailError ? (
                                <div className="bg-status-danger-muted border border-status-danger/40 text-status-danger-dark rounded-xl p-4 md:p-6 text-sm md:text-base">
                                    {detailError}
                                </div>
                            ) : (
                            <article className="bg-white dark:bg-light-navy rounded-xl p-6 md:p-8 lg:p-12 border border-gray-300 dark:border-light-slate/20">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-light-text dark:text-white mb-3 md:mb-4">
                                    {selectedArticle.title}
                                </h1>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-light-muted dark:text-soft-gray text-xs md:text-sm mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-300 dark:border-light-slate/20">
                                    <span>📅 {formatDate(selectedArticle.created_at)}</span>
                                    {selectedArticle.updated_at && selectedArticle.updated_at !== selectedArticle.created_at && (
                                        <span>✏️ Updated: {formatDate(selectedArticle.updated_at)}</span>
                                    )}
                                </div>

                                <div className="prose dark:prose-invert prose-sm md:prose-base lg:prose-lg max-w-none text-light-text dark:text-light-slate">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={detailComponents}
                                    >
                                        {selectedArticle.content}
                                    </ReactMarkdown>
                                </div>
                            </article>
                            )}
                        </div>
                    ) : (
                        /* Articles Grid */
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2 md:px-0">
                            {articles.map((article) => (
                                <div
                                    key={article.slug}
                                    className="bg-white dark:bg-light-navy rounded-xl p-5 md:p-6 border border-gray-300 dark:border-light-slate/20 hover:border-light-accent dark:hover:border-accent-blue/50 transition-all duration-300 cursor-pointer group"
                                    onClick={() => handleSelectArticle(article)}
                                >
                                    <h2 className="text-xl md:text-2xl font-bold text-light-text dark:text-white mb-2 md:mb-3 group-hover:text-light-accent dark:group-hover:text-accent-blue transition-colors line-clamp-2">
                                        {article.title}
                                    </h2>
                                    
                                    <p className="text-light-muted dark:text-soft-gray text-xs md:text-sm mb-3 md:mb-4">
                                        📅 {formatDate(article.created_at)}
                                    </p>

                                    <div className="mb-3 md:mb-4 overflow-hidden">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            className="prose prose-sm dark:prose-invert max-w-none text-light-text dark:text-light-slate line-clamp-3 md:line-clamp-4"
                                            components={listComponents}
                                        >
                                            {buildArticleExcerpt(article.content)}
                                        </ReactMarkdown>
                                    </div>

                                    <div className="flex items-center text-light-accent dark:text-accent-blue text-xs md:text-sm font-medium group-hover:gap-2 transition-all">
                                        <span>Baca selengkapnya</span>
                                        <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer socials={profile.socials} copyright={profile.copyright} />
        </div>
    );
};

export default ArticlesPage;
