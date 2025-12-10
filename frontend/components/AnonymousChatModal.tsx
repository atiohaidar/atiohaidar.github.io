import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { COLORS } from '../utils/styles';
import {
    getAnonymousMessages,
    sendAnonymousMessage,
    deleteAllAnonymousMessages,
    type AnonymousMessage,
} from '../services/chatService';
import { webSocketService } from '../services/websocketService';
import { ChatHeader, MessageBubble, MessageInput, DateSeparator } from './chat';

interface AnonymousChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AnonymousChatModal: React.FC<AnonymousChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<AnonymousMessage[]>([]);
    const [replyTo, setReplyTo] = useState<AnonymousMessage | null>(null);
    const [senderId, setSenderId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isUserScrollingRef = useRef(false);

    useEffect(() => {
        // Generate or retrieve anonymous sender ID
        let storedId = localStorage.getItem('anonymous_sender_id');
        if (!storedId) {
            storedId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('anonymous_sender_id', storedId);
        }
        setSenderId(storedId);
    }, []);

    // Check if user is at bottom of messages
    const checkIfAtBottom = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return true;

        const threshold = 100; // pixels from bottom
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }, []);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollToBottom(false);
        setUnreadCount(0);
    }, []);

    // Handle scroll events
    const handleScroll = useCallback(() => {
        if (!isUserScrollingRef.current) return;

        const isAtBottom = checkIfAtBottom();
        setShowScrollToBottom(!isAtBottom);

        if (isAtBottom) {
            setUnreadCount(0);
        }
    }, [checkIfAtBottom]);

    // Handle user scroll start
    const handleUserScrollStart = useCallback(() => {
        isUserScrollingRef.current = true;
    }, []);

    // Handle user scroll end
    const handleUserScrollEnd = useCallback(() => {
        setTimeout(() => {
            isUserScrollingRef.current = false;
        }, 150);
    }, []);

    // WebSocket message handler
    const handleWebSocketMessage = useCallback((data: any) => {
        // Any message from server implies the socket is alive
        setIsConnected(true);

        if (data.type === 'new_message') {
            setMessages(prev => {
                const exists = prev.some(msg => msg.id === data.message.id);
                if (exists) return prev;
                return [...prev, data.message];
            });
            setTimeout(() => scrollToBottom(), 100);
        } else if (data.type === 'clear_messages') {
            setMessages([]);
        } else if (data.type === 'connections_update' || data.type === 'welcome') {
            if (data.connections) {
                setOnlineUsers(data.connections);
            }
        }
    }, [scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            // Load initial messages
            const loadInitialMessages = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getAnonymousMessages();
                    setMessages(data);
                    setTimeout(() => scrollToBottom(), 100);
                } catch (err: any) {
                    setError(err.message || 'Failed to load messages');
                } finally {
                    setLoading(false);
                }
            };
            loadInitialMessages();

            // Setup WebSocket connection
            webSocketService.ensureConnected();
            webSocketService.onMessage(handleWebSocketMessage);
            setIsConnected(webSocketService.isConnected);

            // Setup scroll event listeners
            const container = messagesContainerRef.current;
            if (container) {
                container.addEventListener('scroll', handleScroll);
                container.addEventListener('touchstart', handleUserScrollStart);
                container.addEventListener('touchend', handleUserScrollEnd);
                container.addEventListener('mousedown', handleUserScrollStart);
                container.addEventListener('mouseup', handleUserScrollEnd);
            }

            // Cleanup function
            return () => {
                webSocketService.offMessage(handleWebSocketMessage);
                webSocketService.disconnect(); // Disconnect when modal closes
                if (container) {
                    container.removeEventListener('scroll', handleScroll);
                    container.removeEventListener('touchstart', handleUserScrollStart);
                    container.removeEventListener('touchend', handleUserScrollEnd);
                    container.removeEventListener('mousedown', handleUserScrollStart);
                    container.removeEventListener('mouseup', handleUserScrollEnd);
                }
            };
        }
    }, [isOpen, handleWebSocketMessage, handleScroll, handleUserScrollStart, handleUserScrollEnd, scrollToBottom]);

    const handleSendMessage = async (content: string, replyToId?: string) => {
        if (!content.trim() || !senderId) return;

        setError(null);
        try {
            // Try WebSocket first
            if (webSocketService.isConnected) {
                webSocketService.sendMessage({
                    type: 'send_message',
                    sender_id: senderId,
                    content: content.trim(),
                    reply_to_id: replyToId
                });

                setReplyTo(null);
            } else {
                // Fallback to REST API
                console.log('WebSocket not connected, using REST API fallback');
                const data: any = {
                    sender_id: senderId,
                    content: content.trim(),
                };

                if (replyToId) {
                    data.reply_to_id = replyToId;
                }

                await sendAnonymousMessage(data);
                setReplyTo(null);
                await loadMessages();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
        }
    };

    const loadMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAnonymousMessages();
            setMessages(data);
            setTimeout(() => scrollToBottom(), 100);
        } catch (err: any) {
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (message: AnonymousMessage) => {
        setReplyTo(message);
    };

    const cancelReply = () => {
        setReplyTo(null);
    };

    // Group messages by date
    const groupMessagesByDate = useCallback((messages: AnonymousMessage[]) => {
        const groups: { [date: string]: AnonymousMessage[] } = {};

        messages.forEach(msg => {
            const date = new Date(msg.created_at);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });

        return groups;
    }, []);

    // Format date header
    const formatDateHeader = useCallback((dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hari Ini';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Kemarin';
        } else {
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    }, []);

    const handleDeleteAllMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            await deleteAllAnonymousMessages();
            setMessages([]);
            setShowResetConfirm(false);
            // Optionally broadcast to other users that messages were cleared
            if (webSocketService.isConnected) {
                webSocketService.sendMessage({
                    type: 'clear_messages',
                    sender_id: senderId,
                    content: 'All messages have been cleared'
                });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete messages');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const chatActions = (
        <div className="flex items-center gap-2">
            <Link
                to="/fullscreen-chat"
                className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
                title="Buka fullscreen chat"
                onClick={() => {
                    webSocketService.disconnect(); // Disconnect before closing modal
                    onClose(); // Close modal when going fullscreen
                }}
            >
                ⛶
            </Link>
            <button
                onClick={() => setShowResetConfirm(true)}
                disabled={loading || messages.length === 0}
                className="p-2 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Hapus semua pesan"
            >
                🗑️
            </button>
            <button
                onClick={loadMessages}
                disabled={loading}
                className="p-2 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Muat ulang pesan"
            >
                {loading ? '⟳' : '🔄'}
            </button>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden`}>

                <ChatHeader
                    isConnected={isConnected}
                    onlineUsers={onlineUsers} // Pass online users if backend supports it
                    onClose={onClose}
                    actions={chatActions}
                />

                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0a1014] relative"
                >
                    {error && (
                        <div className="bg-red-500 text-white p-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    {messages.length === 0 && !loading && (
                        <div className={`text-center text-gray-400 py-8`}>
                            Belum ada pesan. Jadilah yang pertama untuk mengatakan sesuatu!
                        </div>
                    )}

                    {messages.length > 0 && Object.entries(groupMessagesByDate(messages))
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([dateKey, dateMessages]) => (
                            <div key={dateKey}>
                                <DateSeparator dateLabel={formatDateHeader(dateKey)} />

                                {dateMessages
                                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                    .map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            currentUserId={senderId}
                                            isOwnMessage={msg.sender_id === senderId}
                                            onReply={handleReply}
                                        />
                                    ))}
                            </div>
                        ))}

                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />

                    {/* Scroll to bottom button */}
                    {showScrollToBottom && (
                        <button
                            onClick={scrollToBottom}
                            className="fixed bottom-24 right-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full p-3 shadow-lg transition-all duration-200 z-10"
                            title="Lihat pesan terbaru"
                        >
                            <div className="relative">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14l5-5 5 5z" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    )}
                </div>

                <MessageInput
                    onSendMessage={handleSendMessage}
                    isConnected={isConnected}
                    currentUserId={senderId}
                    replyingTo={replyTo}
                    onCancelReply={cancelReply}
                    disabled={loading}
                />
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className={`${COLORS.BG_SECONDARY} ${COLORS.BORDER} relative w-full max-w-md rounded-xl border p-6 shadow-2xl`}>
                        <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            aria-label="Tutup konfirmasi"
                        >
                            ✕
                        </button>
                        <h2 className={`text-xl font-semibold mb-4 ${COLORS.TEXT_PRIMARY}`}>
                            Hapus Semua Pesan?
                        </h2>
                        <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>
                            Tindakan ini akan menghapus semua pesan anonim secara permanen.
                            Pesan yang sudah terkirim tidak dapat dikembalikan.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                className={`flex-1 px-4 py-3 rounded-lg font-semibold border ${COLORS.BORDER} ${COLORS.TEXT_PRIMARY} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAllMessages}
                                disabled={loading}
                                className={`flex-1 px-4 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? 'Menghapus...' : 'Ya, Hapus Semua'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};

export default AnonymousChatModal;
