import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, getAuthToken, clearAuth } from '../apiClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import { useLandingData } from '../contexts/LandingDataContext';
import { useMultiParallax } from '../hooks/useParallax';
import {
    getDiscussions,
    createDiscussion,
    type Discussion,
} from '../services/discussionService';

const DiscussionForumPage: React.FC = () => {
    const navigate = useNavigate();
    const user = getStoredUser();

    // Get pre-fetched data from context for Navbar/Footer
    const { data } = useLandingData();
    const { profile } = data;

    // Parallax effect for background layers
    const parallax = useMultiParallax();

    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        content: '',
        creator_name: '',
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            setLoggedInUser(storedUser.username);
        }
    }, []);

    useEffect(() => {
        loadDiscussions();
    }, []);

    const handleLogout = () => {
        clearAuth();
        setLoggedInUser(null);
        navigate('/', { replace: true });
    };

    const loadDiscussions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDiscussions();
            setDiscussions(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load discussions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDiscussion = async () => {
        if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
            setError('Title and content are required');
            return;
        }

        // If not logged in and no name provided, use Anonymous
        if (!user && !newDiscussion.creator_name.trim()) {
            newDiscussion.creator_name = 'Anonymous';
        }

        setCreating(true);
        setError(null);
        try {
            const data: any = {
                title: newDiscussion.title.trim(),
                content: newDiscussion.content.trim(),
            };

            // Only send creator_name if not logged in
            if (!user && newDiscussion.creator_name.trim()) {
                data.creator_name = newDiscussion.creator_name.trim();
            }

            const created = await createDiscussion(data);
            setIsCreateModalOpen(false);
            setNewDiscussion({ title: '', content: '', creator_name: '' });
            navigate(`/discussions/${created.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create discussion');
        } finally {
            setCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    // Default profile if data not loaded yet
    const defaultProfile = {
        logoSrc: './PP-Tio.jpg',
        socials: {
            github: 'https://github.com/atiohaidar',
            linkedin: 'https://www.linkedin.com/in/atiohaidar/',
            instagram: 'https://www.instagram.com/tiohaidarhanif'
        },
        copyright: '© 2024 Tio Haidar. All rights reserved.'
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
                    <ScrollReveal delay={100}>
                        {/* Page Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-light-text dark:text-white mb-4">
                                Discussion <span className="text-gradient">Forum</span>
                            </h1>
                            <p className="text-light-muted dark:text-soft-gray max-w-2xl mx-auto">
                                Share ideas, ask questions, and engage with the community
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="glass-button px-6 py-3 rounded-full text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 hover:shadow-lg hover:shadow-accent-blue/25 transition-all duration-300 flex items-center gap-2"
                            >
                                <span className="text-lg">+</span>
                                New Discussion
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* Error Message */}
                    {error && (
                        <div className="glass-card border-red-500/30 px-4 py-3 rounded-xl mb-6 text-red-500 text-center">
                            {error}
                        </div>
                    )}

                    {/* Content */}
                    <ScrollReveal delay={200}>
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="inline-block w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
                                <p className="text-light-muted dark:text-soft-gray">Loading discussions...</p>
                            </div>
                        ) : discussions.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <div className="text-5xl mb-4">💬</div>
                                <h3 className="text-xl font-semibold text-light-text dark:text-white mb-2">
                                    No discussions yet
                                </h3>
                                <p className="text-light-muted dark:text-soft-gray">
                                    Be the first to start a discussion!
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {discussions.map((discussion, index) => (
                                    <ScrollReveal key={discussion.id} delay={100 + index * 50}>
                                        <div
                                            onClick={() => navigate(`/discussions/${discussion.id}`)}
                                            className="glass-card rounded-2xl p-6 cursor-pointer hover:scale-[1.01] hover:shadow-xl transition-all duration-300 group"
                                        >
                                            <h2 className="text-xl font-semibold text-light-text dark:text-white mb-2 group-hover:text-accent-blue transition-colors">
                                                {discussion.title}
                                            </h2>
                                            <p className="text-light-muted dark:text-soft-gray mb-4 line-clamp-2">
                                                {discussion.content}
                                            </p>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-light-muted dark:text-slate-400">
                                                    <span className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold text-xs">
                                                        {discussion.creator_name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                    <span className="font-medium">{discussion.creator_name}</span>
                                                    {discussion.is_anonymous && (
                                                        <span className="text-xs opacity-60">(anonymous)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-light-muted dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        {discussion.reply_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatDate(discussion.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        )}
                    </ScrollReveal>
                </div>
            </main>

            {/* Footer */}
            <Footer socials={activeProfile.socials} copyright={activeProfile.copyright} />

            {/* Create Discussion Modal */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
                    onClick={() => setIsCreateModalOpen(false)}
                >
                    <div
                        className="glass-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-light-text dark:text-white">
                                    Create New Discussion
                                </h2>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 rounded-lg text-light-muted dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {!user && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-light-text dark:text-white mb-2">
                                        Your Name (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={newDiscussion.creator_name}
                                        onChange={(e) =>
                                            setNewDiscussion({ ...newDiscussion, creator_name: e.target.value })
                                        }
                                        placeholder="Leave empty to post as Anonymous"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-light-text dark:text-white placeholder-light-muted dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-light-text dark:text-white mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newDiscussion.title}
                                    onChange={(e) =>
                                        setNewDiscussion({ ...newDiscussion, title: e.target.value })
                                    }
                                    placeholder="Enter discussion title"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-light-text dark:text-white placeholder-light-muted dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-light-text dark:text-white mb-2">
                                    Content *
                                </label>
                                <textarea
                                    value={newDiscussion.content}
                                    onChange={(e) =>
                                        setNewDiscussion({ ...newDiscussion, content: e.target.value })
                                    }
                                    placeholder="Share your thoughts, questions, or ideas... (Links are allowed)"
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-light-text dark:text-white placeholder-light-muted dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all resize-none"
                                />
                                <p className="text-xs text-light-muted dark:text-slate-500 mt-1">
                                    Note: You can include links, but file attachments are not supported.
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setNewDiscussion({ title: '', content: '', creator_name: '' });
                                        setError(null);
                                    }}
                                    disabled={creating}
                                    className="glass-button px-6 py-2.5 rounded-full text-sm font-medium text-light-muted dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateDiscussion}
                                    disabled={creating}
                                    className="px-6 py-2.5 rounded-full text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 hover:shadow-lg hover:shadow-accent-blue/25 transition-all disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Discussion'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscussionForumPage;
