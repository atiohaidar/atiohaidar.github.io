import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { listArticles } from '../apiService';
import { getAuthToken, getStoredUser, clearAuth } from '../apiClient';
import { COLORS, LAYOUT, SPACING } from '../utils/styles';
import type { Article } from '../apiTypes';
import type { Profile } from '../types';
import { getProfile } from '../api';

const ArticlesPage: React.FC = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

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
        <div className={`relative ${COLORS.BG_PRIMARY}`}>
            <Navbar
                logoSrc={profile.logoSrc}
                socials={profile.socials}
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
            />

            <main className="mx-auto pt-24 pb-16">
                <div className={`container mx-auto ${SPACING.CONTAINER_PADDING}`}>
                    {/* Header */}
                    <div className="max-w-4xl mx-auto mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            <span className="text-accent-blue">📰</span> Articles
                        </h1>
                        <p className="text-light-slate text-lg">
                            Berbagi pemikiran, pengalaman, dan pembelajaran dalam teknologi dan pengembangan perangkat lunak
                        </p>
                    </div>

                    {/* Articles List */}
                    {articles.length === 0 ? (
                        <div className="max-w-4xl mx-auto text-center py-16">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-light-slate text-xl">
                                Belum ada artikel yang dipublikasikan.
                            </p>
                        </div>
                    ) : selectedArticle ? (
                        /* Article Detail View */
                        <div className="max-w-4xl mx-auto">
                            <button
                                onClick={() => setSelectedArticle(null)}
                                className="flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 mb-6 transition-colors"
                            >
                                ← Kembali ke daftar artikel
                            </button>

                            <article className="bg-light-navy rounded-xl p-8 md:p-12 border border-light-slate/20">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    {selectedArticle.title}
                                </h1>
                                <div className="flex items-center gap-4 text-soft-gray text-sm mb-8 pb-6 border-b border-light-slate/20">
                                    <span>📅 {formatDate(selectedArticle.created_at)}</span>
                                    {selectedArticle.updated_at && selectedArticle.updated_at !== selectedArticle.created_at && (
                                        <span>✏️ Updated: {formatDate(selectedArticle.updated_at)}</span>
                                    )}
                                </div>

                                <div className="prose prose-invert prose-lg max-w-none">
                                    <div className="text-light-slate whitespace-pre-wrap leading-relaxed">
                                        {selectedArticle.content}
                                    </div>
                                </div>
                            </article>
                        </div>
                    ) : (
                        /* Articles Grid */
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                            {articles.map((article) => (
                                <div
                                    key={article.slug}
                                    className="bg-light-navy rounded-xl p-6 border border-light-slate/20 hover:border-accent-blue/50 transition-all duration-300 cursor-pointer group"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-blue transition-colors">
                                        {article.title}
                                    </h2>
                                    
                                    <p className="text-soft-gray text-sm mb-4">
                                        📅 {formatDate(article.created_at)}
                                    </p>

                                    <p className="text-light-slate line-clamp-3 mb-4">
                                        {article.content.substring(0, 200)}
                                        {article.content.length > 200 ? '...' : ''}
                                    </p>

                                    <div className="flex items-center text-accent-blue text-sm font-medium group-hover:gap-2 transition-all">
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
