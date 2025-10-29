import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import { getStoredUser } from '../apiClient';
import {
    getDiscussion,
    createReply,
    deleteDiscussion,
    type DiscussionWithReplies,
} from '../services/discussionService';

const DiscussionDetailPage: React.FC = () => {
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];
    const navigate = useNavigate();
    const { discussionId } = useParams<{ discussionId: string }>();
    const user = getStoredUser();

    const [discussion, setDiscussion] = useState<DiscussionWithReplies | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyName, setReplyName] = useState('');
    const [replying, setReplying] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (discussionId) {
            loadDiscussion();
        }
    }, [discussionId]);

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
                        className={`${palette.accent} hover:underline`}
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

    if (loading) {
        return (
            <div className={`min-h-screen ${palette.background}`}>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-8">
                        <div className={`text-lg ${palette.textMuted}`}>Loading discussion...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !discussion) {
        return (
            <div className={`min-h-screen ${palette.background}`}>
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/discussions')}
                        className={`${palette.accent} hover:opacity-90 text-white px-4 py-2 rounded-lg`}
                    >
                        ← Back to Discussions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${palette.background}`}>
            {/* Header */}
            <div className={`${palette.primary} shadow-lg`}>
                <div className="container mx-auto px-4 py-6">
                    <button
                        onClick={() => navigate('/discussions')}
                        className={`${palette.text} hover:underline mb-2`}
                    >
                        ← Back to Discussions
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {discussion && (
                    <>
                        {/* Discussion */}
                        <div className={`${palette.card} rounded-lg shadow-md p-6 mb-6`}>
                            <div className="flex justify-between items-start mb-4">
                                <h1 className={`text-3xl font-bold ${palette.text}`}>
                                    {discussion.title}
                                </h1>
                                {canDelete && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                )}
                            </div>

                            <div className={`${palette.textMuted} text-sm mb-4`}>
                                By <span className="font-medium">{discussion.creator_name}</span>
                                {discussion.is_anonymous && (
                                    <span className="ml-1">(anonymous)</span>
                                )}
                                {' • '}
                                <span>{formatDate(discussion.created_at)}</span>
                            </div>

                            <div className={`${palette.text} whitespace-pre-wrap`}>
                                {renderContentWithLinks(discussion.content)}
                            </div>
                        </div>

                        {/* Replies Section */}
                        <div className={`${palette.card} rounded-lg shadow-md p-6 mb-6`}>
                            <h2 className={`text-xl font-bold ${palette.text} mb-4`}>
                                Replies ({discussion.replies?.length || 0})
                            </h2>

                            {discussion.replies && discussion.replies.length > 0 ? (
                                <div className="space-y-4">
                                    {discussion.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={`border-l-4 ${palette.inputBorder} pl-4 py-2`}
                                        >
                                            <div className={`${palette.textMuted} text-sm mb-2`}>
                                                <span className="font-medium">{reply.creator_name}</span>
                                                {reply.is_anonymous && (
                                                    <span className="ml-1">(anonymous)</span>
                                                )}
                                                {' • '}
                                                <span>{formatDate(reply.created_at)}</span>
                                            </div>
                                            <div className={palette.text}>
                                                {renderContentWithLinks(reply.content)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`${palette.textMuted} italic`}>
                                    No replies yet. Be the first to reply!
                                </p>
                            )}
                        </div>

                        {/* Reply Form */}
                        <div className={`${palette.card} rounded-lg shadow-md p-6`}>
                            <h2 className={`text-xl font-bold ${palette.text} mb-4`}>
                                Post a Reply
                            </h2>

                            {!user && (
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium ${palette.text} mb-2`}>
                                        Your Name (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={replyName}
                                        onChange={(e) => setReplyName(e.target.value)}
                                        placeholder="Leave empty to post as Anonymous"
                                        className={`w-full px-3 py-2 border ${palette.inputBorder} rounded-lg ${palette.input}`}
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write your reply... (Links are allowed)"
                                    rows={4}
                                    className={`w-full px-3 py-2 border ${palette.inputBorder} rounded-lg ${palette.input}`}
                                />
                            </div>

                            <button
                                onClick={handleReply}
                                disabled={replying || !replyContent.trim()}
                                className={`${palette.accent} hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50`}
                            >
                                {replying ? 'Posting...' : 'Post Reply'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DiscussionDetailPage;
