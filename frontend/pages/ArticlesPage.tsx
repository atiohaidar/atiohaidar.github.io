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
import { Card, Button, Typography, Heading, Text } from '../components/ui';
import { COLORS, LAYOUT } from '../utils/styles';

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
            className={`${className ?? ''} ${inline ? 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono' : 'block bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 my-4 overflow-x-auto font-mono'}`.trim()}
            {...rest}
        >
            {children}
        </code>
    );
};

const detailComponents: Components = {
    a: ({ node, ...props }) => (
        <a className="text-blue-600 dark:text-blue-400 hover:underline font-patrick" {...props} />
    ),
    code: renderCodeBlock,
    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed font-patrick text-lg" {...props} />,
    h1: ({ node, ...props }) => <Heading level={1} className="mt-8 mb-4" {...props} />,
    h2: ({ node, ...props }) => <Heading level={2} className="mt-6 mb-3" {...props} />,
    h3: ({ node, ...props }) => <Heading level={3} className="mt-4 mb-2" {...props} />,
};

const listComponents: Components = {
    h1: ({ node, ...props }) => (
        <Heading level={3} className="text-xl mb-2" {...props} />
    ),
    h2: ({ node, ...props }) => (
        <Heading level={4} className="text-lg mb-2" {...props} />
    ),
    p: ({ node, ...props }) => (
        <Typography variant="body" className="text-sm line-clamp-3 mb-2 font-patrick" {...props} />
    ),
    a: ({ node, ...props }) => (
        <span className="text-blue-600 dark:text-blue-400 font-patrick" {...props} />
    ),
    code: renderCodeBlock,
};

const ArticlesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data } = useLandingData();
    const { profile } = data;
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const activeProfile = profile || {
        logoSrc: './PP-Tio.jpg',
        socials: {
            github: 'https://github.com/atiohaidar',
            linkedin: 'https://www.linkedin.com/in/atiohaidar/',
            instagram: 'https://www.instagram.com/tiohaidarhanif'
        },
        copyright: 'Sebuah website random'
    };

    return (
        <div className={`relative min-h-screen ${COLORS.BG_PRIMARY} transition-colors duration-300 overflow-hidden`}>
            {/* Global Background Elements */}
            <div className="fixed inset-0 notebook-lines opacity-10 pointer-events-none -z-10" />

            {/* Animated Orbs with Parallax */}
            <div
                className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-blob -z-10 pointer-events-none"
                style={{ transform: `translateY(${parallax.getOffset(0.05, 'down')}px)` }}
            />
            <div
                className="fixed bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000 -z-10 pointer-events-none"
                style={{ transform: `translateY(${parallax.getOffset(0.08, 'down')}px)` }}
            />

            {/* Navbar */}
            <Navbar
                logoSrc={activeProfile.logoSrc}
                socials={activeProfile.socials}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="mx-auto relative z-10 pt-32 pb-24">
                <div className="container mx-auto px-6 md:px-12">
                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-32">
                            <div className="inline-block w-12 h-12 border-4 border-dashed border-blue-400 border-t-transparent rounded-full animate-spin mb-6" />
                            <Typography variant="h3" className={`${COLORS.TEXT_SECONDARY} font-caveat opacity-70`}>Memuat rak buku...</Typography>
                        </div>
                    ) : error ? (
                        <Card variant="glass" className="border-red-500/30 px-6 py-4 rounded-xl text-red-500 text-center max-w-2xl mx-auto transform rotate-1">
                            <span className="text-2xl mr-2">⚠️</span> {error}
                        </Card>
                    ) : (
                        <>
                            {/* Header */}
                            {!selectedArticle && (
                                <ScrollReveal delay={100}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-2 border-dashed border-gray-200 dark:border-gray-800 pb-8">
                                        <div className="text-left w-full md:w-auto">
                                            <Heading level={1} className={`${COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-3`}>
                                                <span className="text-4xl">📰</span> Articles
                                            </Heading>
                                            <Typography variant="h4" className={`${COLORS.TEXT_SECONDARY} font-patrick italic opacity-80 max-w-xl`}>
                                                Catatan perjalanan, pemikiran, dan eksperimen dalam dunia teknologi dan kehidupan.
                                            </Typography>
                                        </div>
                                        <Button
                                            as={Link}
                                            to="/dashboard/articles"
                                            variant="glass"
                                            size="md"
                                            className="font-patrick text-lg transform hover:-rotate-1 transition-transform"
                                        >
                                            📝 Kelola Artikel
                                        </Button>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Content */}
                            {articles.length === 0 ? (
                                <ScrollReveal delay={200}>
                                    <div className="text-center py-20 flex flex-col items-center gap-6">
                                        <div className="text-7xl opacity-30 grayscale transform -rotate-12">📚</div>
                                        <Heading level={2} className={`${COLORS.TEXT_SECONDARY} font-caveat opacity-60`}>
                                            Rak ini masih kosong semilir...
                                        </Heading>
                                    </div>
                                </ScrollReveal>
                            ) : selectedArticle ? (
                                /* Article Detail View */
                                <ScrollReveal delay={150}>
                                    <div className="max-w-4xl mx-auto">
                                        <button
                                            onClick={handleBackToList}
                                            className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-all mb-8 font-patrick group"
                                        >
                                            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                                            Kembali ke daftar artikel
                                        </button>

                                        {detailLoading ? (
                                            <div className="text-center py-32">
                                                <div className="inline-block w-12 h-12 border-4 border-dashed border-blue-400 border-t-transparent rounded-full animate-spin mb-6" />
                                                <Typography variant="h3" className={`${COLORS.TEXT_SECONDARY} font-caveat opacity-70`}>Membuka lembaran...</Typography>
                                            </div>
                                        ) : detailError ? (
                                            <Card variant="glass" className="border-red-500/30 p-8 text-red-500 text-center transform rotate-1">
                                                {detailError}
                                            </Card>
                                        ) : (
                                            <article className="relative">
                                                {/* Tape deco */}
                                                <div className="absolute -top-4 left-1/4 w-32 h-10 bg-blue-100/40 dark:bg-blue-900/10 -rotate-2 z-20"></div>

                                                <Card variant="glass" padding="none" className="overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-xl">
                                                    <div className="p-8 md:p-12 lg:p-16">
                                                        <Heading level={1} className={`${COLORS.TEXT_PRIMARY} mb-6 leading-tight`}>
                                                            {selectedArticle.title}
                                                        </Heading>

                                                        <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 text-sm mb-12 pb-8 border-b-2 border-dashed border-gray-100 dark:border-gray-900">
                                                            <span className="flex items-center gap-2 font-patrick italic">
                                                                📅 {formatDate(selectedArticle.created_at)}
                                                            </span>
                                                            {selectedArticle.updated_at && selectedArticle.updated_at !== selectedArticle.created_at && (
                                                                <span className="flex items-center gap-2 font-patrick italic opacity-60">
                                                                    ✏️ Diperbarui: {formatDate(selectedArticle.updated_at)}
                                                                </span>
                                                            )}
                                                            <div className="ml-auto flex items-center gap-4">
                                                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                                                                    PUBLISHED
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="max-w-none text-gray-800 dark:text-gray-200">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={[rehypeRaw]}
                                                                components={detailComponents}
                                                            >
                                                                {selectedArticle.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </article>
                                        )}
                                    </div>
                                </ScrollReveal>
                            ) : (
                                /* Articles Grid */
                                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {articles.map((article, index) => (
                                        <ScrollReveal key={article.slug} delay={150 + index * 50}>
                                            <Card
                                                variant="glass"
                                                padding="none"
                                                className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 h-full border-2 border-dashed border-gray-200 dark:border-gray-800 ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transform`}
                                                onClick={() => handleSelectArticle(article)}
                                            >
                                                <div className="p-8 flex flex-col h-full">
                                                    <div className="mb-4">
                                                        <span className="text-xs font-bold text-blue-500/60 dark:text-blue-400/50 uppercase tracking-widest font-mono">
                                                            #{index + 1} ARTICLE
                                                        </span>
                                                    </div>

                                                    <Heading level={2} className={`text-2xl md:text-3xl ${COLORS.TEXT_PRIMARY} mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight`}>
                                                        {article.title}
                                                    </Heading>

                                                    <Typography variant="caption" className="flex items-center gap-2 text-gray-400 italic mb-6 font-patrick">
                                                        <span>📅</span> {formatDate(article.created_at)}
                                                    </Typography>

                                                    <div className="mb-8 overflow-hidden relative">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            rehypePlugins={[rehypeRaw]}
                                                            className="text-gray-600 dark:text-gray-400 line-clamp-4"
                                                            components={listComponents}
                                                        >
                                                            {buildArticleExcerpt(article.content)}
                                                        </ReactMarkdown>
                                                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-gray-900 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>

                                                    <div className="mt-auto flex items-center justify-between pointer-events-none">
                                                        <span className={`text-blue-500 font-bold font-patrick underline decoration-dashed decoration-2 underline-offset-4 transform group-hover:scale-110 transition-transform origin-left`}>
                                                            Baca selengkapnya
                                                        </span>
                                                        <span className="text-3xl opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                                                            📎
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
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

