import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import { getStoredUser } from '../apiClient';
import {
    getDiscussions,
    createDiscussion,
    type Discussion,
} from '../services/discussionService';

const DiscussionForumPage: React.FC = () => {
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];
    const navigate = useNavigate();
    const user = getStoredUser();

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
        loadDiscussions();
    }, []);

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

    return (
        <div className={`min-h-screen ${palette.background}`}>
            {/* Header */}
            <div className={`${palette.primary} shadow-lg`}>
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <button
                                onClick={() => navigate('/')}
                                className={`${palette.text} hover:underline mb-2`}
                            >
                                ← Back to Home
                            </button>
                            <h1 className={`text-3xl font-bold ${palette.text}`}>
                                Discussion Forum
                            </h1>
                            <p className={`${palette.textMuted} mt-1`}>
                                Share ideas, ask questions, and engage with the community
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={`${palette.accent} hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-all`}
                        >
                            + New Discussion
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <div className={`text-lg ${palette.textMuted}`}>Loading discussions...</div>
                    </div>
                ) : discussions.length === 0 ? (
                    <div className={`${palette.card} rounded-lg shadow-md p-8 text-center`}>
                        <div className={`text-xl ${palette.textMuted} mb-4`}>
                            No discussions yet
                        </div>
                        <p className={palette.textMuted}>
                            Be the first to start a discussion!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {discussions.map((discussion) => (
                            <div
                                key={discussion.id}
                                onClick={() => navigate(`/discussions/${discussion.id}`)}
                                className={`${palette.card} rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow`}
                            >
                                <h2 className={`text-xl font-semibold ${palette.text} mb-2`}>
                                    {discussion.title}
                                </h2>
                                <p className={`${palette.textMuted} mb-3 line-clamp-2`}>
                                    {discussion.content}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className={palette.textMuted}>
                                        By <span className="font-medium">{discussion.creator_name}</span>
                                        {discussion.is_anonymous && (
                                            <span className="ml-1 text-xs">(anonymous)</span>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-4 ${palette.textMuted}`}>
                                        <span>
                                            {discussion.reply_count || 0} {discussion.reply_count === 1 ? 'reply' : 'replies'}
                                        </span>
                                        <span>{formatDate(discussion.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Discussion Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${palette.card} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                        <div className="p-6">
                            <h2 className={`text-2xl font-bold ${palette.text} mb-4`}>
                                Create New Discussion
                            </h2>

                            {!user && (
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium ${palette.text} mb-2`}>
                                        Your Name (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={newDiscussion.creator_name}
                                        onChange={(e) =>
                                            setNewDiscussion({ ...newDiscussion, creator_name: e.target.value })
                                        }
                                        placeholder="Leave empty to post as Anonymous"
                                        className={`w-full px-3 py-2 border ${palette.inputBorder} rounded-lg ${palette.input}`}
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label className={`block text-sm font-medium ${palette.text} mb-2`}>
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newDiscussion.title}
                                    onChange={(e) =>
                                        setNewDiscussion({ ...newDiscussion, title: e.target.value })
                                    }
                                    placeholder="Enter discussion title"
                                    className={`w-full px-3 py-2 border ${palette.inputBorder} rounded-lg ${palette.input}`}
                                />
                            </div>

                            <div className="mb-4">
                                <label className={`block text-sm font-medium ${palette.text} mb-2`}>
                                    Content *
                                </label>
                                <textarea
                                    value={newDiscussion.content}
                                    onChange={(e) =>
                                        setNewDiscussion({ ...newDiscussion, content: e.target.value })
                                    }
                                    placeholder="Share your thoughts, questions, or ideas... (Links are allowed)"
                                    rows={6}
                                    className={`w-full px-3 py-2 border ${palette.inputBorder} rounded-lg ${palette.input}`}
                                />
                                <p className={`text-xs ${palette.textMuted} mt-1`}>
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
                                    className={`px-4 py-2 rounded-lg ${palette.button} hover:opacity-90 transition-all`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateDiscussion}
                                    disabled={creating}
                                    className={`${palette.accent} hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50`}
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
