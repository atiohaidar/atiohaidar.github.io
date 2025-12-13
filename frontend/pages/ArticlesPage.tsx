import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import { listArticles, getArticle } from '../apiService';
import { getAuthToken, getStoredUser, clearAuth } from '../apiClient';
import { useLandingData } from '../contexts/LandingDataContext';
import { useMultiParallax } from '../hooks/useParallax';
import type { Article } from '../apiTypes';

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
        <a className="text-accent-blue hover:underline" {...props} />
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
        <a className="text-accent-blue hover:underline" {...props} />
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

    // Get pre-fetched data from context for Navbar/Footer
    const { data } = useLandingData();
    const { profile } = data;

    // Parallax effect for background layers
    const parallax = useMultiParallax();

    const [articles, setArticles] = useState<Article[]>([]);
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
                const articlesData = await listArticles({ page: 0, published: true });
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

    // Default profile if data not loaded yet
    const defaultProfile = {
        logoSrc: './PP-Tio.jpg',
        socials: {
            github: 'https://github.com/atiohaidar',
            linkedin: 'https://www.linkedin.com/in/atiohaidar/',
            instagram: 'https://www.instagram.com/tiohaidarhanif'
        },
        copyright: 'Sebuah website random'
    };

    const activeProfile = profile || defaultProfile;

    return (
        <div className="relative min-h-screen bg-light-bg dark:bg-deep-navy transition-colors duration-300 overflow-hidden">
            {/* Global Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 -z-10" />

            {/* Animated Orbs with Parallax (Fixed) */}
            <div
                className="fixed top-[20%] right-[10%] w-[600px] h-[600px] bg-accent-blue/40 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                style={{ transform: `translateY(${parallax.getOffset(0.05, 'down')}px)` }}
            />
            <div
                className="fixed bottom-[20%] left-[10%] w-[600px] h-[600px] bg-purple-500/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                style={{ transform: `translateY(${parallax.getOffset(0.08, 'down')}px)` }}
            />
            <div
                className="fixed top-[40%] left-[40%] w-[600px] h-[600px] bg-cyan-500/40 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-90 -z-10 pointer-events-none"
                style={{ transform: `translateY(${parallax.getOffset(0.12, 'down')}px)` }}
            />

            {/* Navbar */}
            <Navbar
                logoSrc={activeProfile.logoSrc}
                socials={activeProfile.socials}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="mx-auto relative z-10 pt-32 pb-16">
                <div className="container mx-auto px-6 md:px-12">
                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
                            <p className="text-light-muted dark:text-soft-gray">Memuat artikel...</p>
                        </div>
                    ) : error ? (
                        <div className="glass-card border-red-500/30 px-6 py-4 rounded-xl text-red-500 text-center max-w-2xl mx-auto">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <ScrollReveal delay={100}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <div className="text-center md:text-left w-full md:w-auto">
                                        <h1 className="text-4xl md:text-5xl font-bold text-light-text dark:text-white mb-2">
                                            <span className="text-gradient">📰</span> Articles
                                        </h1>
                                        <p className="text-light-muted dark:text-soft-gray">
                                            Berbagi pemikiran, pengalaman, dan pembelajaran dalam teknologi
                                        </p>
                                    </div>
                                    <Link
                                        to="/dashboard/articles"
                                        className="glass-button px-5 py-2.5 rounded-full text-sm font-medium text-accent-blue hover:bg-accent-blue hover:text-white transition-all"
                                    >
                                        📝 Kelola Artikel
                                    </Link>
                                </div>
                            </ScrollReveal>

                            {/* Content */}
                            {articles.length === 0 ? (
                                <ScrollReveal delay={200}>
                                    <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto">
                                        <div className="text-5xl mb-4">📝</div>
                                        <h3 className="text-xl font-semibold text-light-text dark:text-white mb-2">
                                            Belum ada artikel
                                        </h3>
                                        <p className="text-light-muted dark:text-soft-gray">
                                            Belum ada artikel yang dipublikasikan.
                                        </p>
                                    </div>
                                </ScrollReveal>
                            ) : selectedArticle ? (
                                /* Article Detail View */
                                <ScrollReveal delay={150}>
                                    <div className="max-w-4xl mx-auto">
                                        <button
                                            onClick={handleBackToList}
                                            className="flex items-center gap-2 text-light-muted dark:text-slate-400 hover:text-accent-blue transition-colors mb-6"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Kembali ke daftar artikel
                                        </button>

                                        {detailLoading ? (
                                            <div className="glass-card rounded-2xl p-8 text-center">
                                                <div className="inline-block w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
                                                <p className="text-light-muted dark:text-soft-gray">Memuat artikel…</p>
                                            </div>
                                        ) : detailError ? (
                                            <div className="glass-card border-red-500/30 rounded-2xl p-6 text-red-500 text-center">
                                                {detailError}
                                            </div>
                                        ) : (
                                            <article className="glass-card rounded-2xl p-6 md:p-8 lg:p-12">
                                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-light-text dark:text-white mb-4">
                                                    {selectedArticle.title}
                                                </h1>
                                                <div className="flex flex-wrap items-center gap-4 text-light-muted dark:text-soft-gray text-sm mb-8 pb-6 border-b border-gray-200 dark:border-white/10">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(selectedArticle.created_at)}
                                                    </span>
                                                    {selectedArticle.updated_at && selectedArticle.updated_at !== selectedArticle.created_at && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Updated: {formatDate(selectedArticle.updated_at)}
                                                        </span>
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
                                </ScrollReveal>
                            ) : (
                                /* Articles Grid */
                                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {articles.map((article, index) => (
                                        <ScrollReveal key={article.slug} delay={150 + index * 50}>
                                            <div
                                                className="glass-card rounded-2xl p-6 cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group h-full"
                                                onClick={() => handleSelectArticle(article)}
                                            >
                                                <h2 className="text-xl md:text-2xl font-bold text-light-text dark:text-white mb-3 group-hover:text-accent-blue transition-colors line-clamp-2">
                                                    {article.title}
                                                </h2>

                                                <p className="text-light-muted dark:text-soft-gray text-sm mb-4 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(article.created_at)}
                                                </p>

                                                <div className="mb-4 overflow-hidden">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                        className="prose prose-sm dark:prose-invert max-w-none text-light-text dark:text-light-slate line-clamp-3"
                                                        components={listComponents}
                                                    >
                                                        {buildArticleExcerpt(article.content)}
                                                    </ReactMarkdown>
                                                </div>

                                                <div className="flex items-center text-accent-blue text-sm font-medium group-hover:gap-2 transition-all mt-auto">
                                                    <span>Baca selengkapnya</span>
                                                    <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <Footer socials={activeProfile.socials} copyright={activeProfile.copyright} />
        </div>
    );
};

export default ArticlesPage;
