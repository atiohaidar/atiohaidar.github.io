import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoredUser, getAuthToken, clearAuth } from '../apiClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import { useLandingData } from '../contexts/LandingDataContext';
import { useMultiParallax } from '../hooks/useParallax';
import {
    getDiscussion,
    createReply,
    deleteDiscussion,
    type DiscussionWithReplies,
} from '../services/discussionService';

const DiscussionDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { discussionId } = useParams<{ discussionId: string }>();
    const user = getStoredUser();

    // Get pre-fetched data from context for Navbar/Footer
    const { data } = useLandingData();
    const { profile } = data;

    // Parallax effect for background layers
    const parallax = useMultiParallax();

    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [discussion, setDiscussion] = useState<DiscussionWithReplies | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyName, setReplyName] = useState('');
    const [replying, setReplying] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
            setLoggedInUser(storedUser.username);
        }
    }, []);

    useEffect(() => {
        if (discussionId) {
            loadDiscussion();
        }
    }, [discussionId]);

    const handleLogout = () => {
        clearAuth();
        setLoggedInUser(null);
        navigate('/', { replace: true });
    };

    const loadDiscussion = async () => {
        if (!discussionId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await getDiscussion(discussionId);
            setDiscussion(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load discussion');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!discussionId || !replyContent.trim()) {
            setError('Reply content is required');
            return;
        }

        // If not logged in and no name provided, use Anonymous
        if (!user && !replyName.trim()) {
            setReplyName('Anonymous');
        }

        setReplying(true);
        setError(null);
        try {
            const data: any = {
                content: replyContent.trim(),
            };

            // Only send creator_name if not logged in
            if (!user && replyName.trim()) {
                data.creator_name = replyName.trim();
            }

            await createReply(discussionId, data);
            setReplyContent('');
            setReplyName('');
            await loadDiscussion();
        } catch (err: any) {
            setError(err.message || 'Failed to post reply');
        } finally {
            setReplying(false);
        }
    };

    const handleDelete = async () => {
        if (!discussionId || !discussion) return;

        if (!confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        setError(null);
        try {
            await deleteDiscussion(discussionId);
            navigate('/discussions');
        } catch (err: any) {
            setError(err.message || 'Failed to delete discussion');
            setDeleting(false);
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

    const renderContentWithLinks = (content: string) => {
        // Simple URL detection and conversion
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-blue hover:underline"
                    >
                        {part}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const canDelete = discussion && user && (
        user.role === 'admin' ||
        (discussion.creator_username && discussion.creator_username === user.username)
    );

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
                <div className="container mx-auto px-6 md:px-12 max-w-4xl">
                    {/* Back Button */}
                    <ScrollReveal delay={100}>
                        <button
                            onClick={() => navigate('/discussions')}
                            className="mb-6 flex items-center gap-2 text-light-muted dark:text-slate-400 hover:text-accent-blue transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Discussions
                        </button>
                    </ScrollReveal>

                    {/* Error Message */}
                    {error && (
                        <div className="glass-card border-red-500/30 px-4 py-3 rounded-xl mb-6 text-red-500 text-center">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
                            <p className="text-light-muted dark:text-soft-gray">Loading discussion...</p>
                        </div>
                    ) : !discussion ? (
                        <div className="glass-card rounded-2xl p-12 text-center">
                            <div className="text-5xl mb-4">❌</div>
                            <h3 className="text-xl font-semibold text-light-text dark:text-white mb-2">
                                Discussion not found
                            </h3>
                            <p className="text-light-muted dark:text-soft-gray">
                                The discussion you're looking for doesn't exist or has been deleted.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Main Discussion */}
                            <ScrollReveal delay={150}>
                                <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-white">
                                            {discussion.title}
                                        </h1>
                                        {canDelete && (
                                            <button
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {deleting ? 'Deleting...' : 'Delete'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mb-6 text-sm text-light-muted dark:text-slate-400">
                                        <span className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold text-sm">
                                            {discussion.creator_name.substring(0, 2).toUpperCase()}
                                        </span>
                                        <div>
                                            <span className="font-medium text-light-text dark:text-white">{discussion.creator_name}</span>
                                            {discussion.is_anonymous && (
                                                <span className="ml-1 opacity-60">(anonymous)</span>
                                            )}
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(discussion.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="text-light-text dark:text-soft-gray whitespace-pre-wrap leading-relaxed">
                                        {renderContentWithLinks(discussion.content)}
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Replies Section */}
                            <ScrollReveal delay={200}>
                                <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
                                    <h2 className="text-xl font-bold text-light-text dark:text-white mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Replies ({discussion.replies?.length || 0})
                                    </h2>

                                    {discussion.replies && discussion.replies.length > 0 ? (
                                        <div className="space-y-4">
                                            {discussion.replies.map((reply, index) => (
                                                <div
                                                    key={reply.id}
                                                    className="border-l-2 border-accent-blue/30 pl-4 py-3 hover:border-accent-blue transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 mb-2 text-sm">
                                                        <span className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold text-xs">
                                                            {reply.creator_name.substring(0, 2).toUpperCase()}
                                                        </span>
                                                        <span className="font-medium text-light-text dark:text-white">{reply.creator_name}</span>
                                                        {reply.is_anonymous && (
                                                            <span className="text-light-muted dark:text-slate-500 text-xs">(anonymous)</span>
                                                        )}
                                                        <span className="text-light-muted dark:text-slate-500">•</span>
                                                        <span className="text-light-muted dark:text-slate-500">{formatDate(reply.created_at)}</span>
                                                    </div>
                                                    <div className="text-light-text dark:text-soft-gray pl-9">
                                                        {renderContentWithLinks(reply.content)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-light-muted dark:text-slate-500 italic text-center py-4">
                                            No replies yet. Be the first to reply!
                                        </p>
                                    )}
                                </div>
                            </ScrollReveal>

                            {/* Reply Form */}
                            <ScrollReveal delay={250}>
                                <div className="glass-card rounded-2xl p-6 md:p-8">
                                    <h2 className="text-xl font-bold text-light-text dark:text-white mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                        Post a Reply
                                    </h2>

                                    {!user && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-light-text dark:text-white mb-2">
                                                Your Name (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={replyName}
                                                onChange={(e) => setReplyName(e.target.value)}
                                                placeholder="Leave empty to post as Anonymous"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-light-text dark:text-white placeholder-light-muted dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Write your reply... (Links are allowed)"
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-light-text dark:text-white placeholder-light-muted dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleReply}
                                        disabled={replying || !replyContent.trim()}
                                        className="px-6 py-2.5 rounded-full text-sm font-medium bg-accent-blue text-white hover:bg-accent-blue/90 hover:shadow-lg hover:shadow-accent-blue/25 transition-all disabled:opacity-50"
                                    >
                                        {replying ? 'Posting...' : 'Post Reply'}
                                    </button>
                                </div>
                            </ScrollReveal>
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <Footer socials={activeProfile.socials} copyright={activeProfile.copyright} />
        </div>
    );
};

export default DiscussionDetailPage;
