import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../utils/styles';

interface Whiteboard {
    id: string;
    title: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    is_active: number;
}

const WhiteboardListPage: React.FC = () => {
    const navigate = useNavigate();
    const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; canRetry: boolean } | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWhiteboardTitle, setNewWhiteboardTitle] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadWhiteboards();
    }, []);

    const loadWhiteboards = async (isRetry = false) => {
        try {
            if (!isRetry) {
                setLoading(true);
                setError(null);
            }
            
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
            const response = await fetch(`${apiUrl}/api/whiteboards`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to load whiteboards');
            }
            
            const data = await response.json();
            setWhiteboards(data.whiteboards || []);
            setRetryCount(0);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load whiteboards. Please try again.';
            setError({ 
                message: errorMessage, 
                canRetry: retryCount < 3 
            });
            
            if (retryCount < 3) {
                // Auto-retry with exponential backoff
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    loadWhiteboards(true);
                }, delay);
            }
            
            console.error('Error loading whiteboards:', err);
        } finally {
            if (!isRetry) {
                setLoading(false);
            }
        }
    };

    const handleCreateWhiteboard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWhiteboardTitle.trim()) {
            return;
        }

        try {
            setCreating(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
            const response = await fetch(`${apiUrl}/api/whiteboards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newWhiteboardTitle,
                    created_by: 'anonymous'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create whiteboard');
            }

            const newWhiteboard = await response.json();
            setShowCreateModal(false);
            setNewWhiteboardTitle('');
            navigate(`/whiteboard/${newWhiteboard.id}`);
        } catch (err) {
            console.error('Failed to create whiteboard:', err);
            alert('Failed to create whiteboard. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteWhiteboard = async (id: string) => {
        if (!confirm('Are you sure you want to delete this whiteboard?')) {
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
            const response = await fetch(`${apiUrl}/api/whiteboards/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete whiteboard');
            }

            await loadWhiteboards();
        } catch (err) {
            console.error('Failed to delete whiteboard:', err);
            alert('Failed to delete whiteboard. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${COLORS.BG_PRIMARY} flex items-center justify-center`}>
                <div className={`text-xl ${COLORS.TEXT_PRIMARY}`}>Loading whiteboards...</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${COLORS.BG_PRIMARY}`}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className={`text-3xl font-bold ${COLORS.TEXT_PRIMARY} mb-2`}>
                            🎨 Collaborative Whiteboards
                        </h1>
                        <p className={COLORS.TEXT_SECONDARY}>
                            Create and collaborate on whiteboards in real-time
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className={`px-4 py-2 rounded-lg border ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
                        >
                            ← Back to Home
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className={`px-6 py-2 rounded-lg ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity`}
                        >
                            + New Whiteboard
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                    </div>
                )}

                {/* Whiteboard Grid */}
                {whiteboards.length === 0 ? (
                    <div className={`text-center py-16 ${COLORS.TEXT_SECONDARY}`}>
                        <p className="text-xl mb-4">No whiteboards yet</p>
                        <p>Create your first whiteboard to start collaborating!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {whiteboards.map((whiteboard) => (
                            <div
                                key={whiteboard.id}
                                className={`${COLORS.BG_SECONDARY} rounded-xl p-6 border ${COLORS.BORDER} hover:shadow-lg transition-shadow cursor-pointer`}
                                onClick={() => navigate(`/whiteboard/${whiteboard.id}`)}
                            >
                                <h3 className={`text-xl font-semibold ${COLORS.TEXT_PRIMARY} mb-2`}>
                                    {whiteboard.title}
                                </h3>
                                <p className={`${COLORS.TEXT_SECONDARY} text-sm mb-4`}>
                                    Created {new Date(whiteboard.created_at).toLocaleDateString()}
                                </p>
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/whiteboard/${whiteboard.id}`);
                                        }}
                                        className={`px-4 py-2 rounded-lg ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} text-sm hover:opacity-90 transition-opacity`}
                                    >
                                        Open
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteWhiteboard(whiteboard.id);
                                        }}
                                        className="px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className={`${COLORS.BG_SECONDARY} relative w-full max-w-md rounded-xl border ${COLORS.BORDER} p-6 shadow-2xl`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <h2 className={`text-2xl font-semibold mb-4 ${COLORS.TEXT_PRIMARY}`}>
                            Create New Whiteboard
                        </h2>
                        <form onSubmit={handleCreateWhiteboard}>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${COLORS.TEXT_PRIMARY}`}>
                                    Whiteboard Title
                                </label>
                                <input
                                    type="text"
                                    value={newWhiteboardTitle}
                                    onChange={(e) => setNewWhiteboardTitle(e.target.value)}
                                    placeholder="e.g., Project Brainstorming"
                                    className={`w-full px-4 py-3 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-coral-pink`}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className={`w-full px-4 py-3 rounded-lg font-semibold ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity disabled:opacity-50`}
                            >
                                {creating ? 'Creating...' : 'Create Whiteboard'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhiteboardListPage;
