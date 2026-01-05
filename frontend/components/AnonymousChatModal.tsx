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
import { Card, Button, Heading, Typography } from './ui';

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
        <div className="flex items-center gap-1 sm:gap-2">
            <Link
                to="/fullscreen-chat"
                className={`p-2 rounded-full ${COLORS.TEXT_SECONDARY} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
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
                className={`p-2 rounded-full ${COLORS.TEXT_SECONDARY} hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Hapus semua pesan"
            >
                🗑️
            </button>
            <button
                onClick={loadMessages}
                disabled={loading}
                className={`p-2 rounded-full ${COLORS.TEXT_SECONDARY} hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30`}
                title="Muat ulang pesan"
            >
                <span className={loading ? 'animate-spin inline-block' : ''}>
                    🔄
                </span>
            </button>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
            <Card variant="glass" padding="none" className="max-w-4xl w-full h-full max-h-[90vh] flex flex-col overflow-hidden">

                <ChatHeader
                    isConnected={isConnected}
                    onlineUsers={onlineUsers}
                    onClose={onClose}
                    actions={chatActions}
                />

                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative"
                >
                    {/* Notebook Lines Background Effect */}
                    <div className="absolute inset-0 notebook-lines opacity-10 pointer-events-none z-0"></div>

                    <div className="relative z-10 space-y-4">
                        {error && (
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-dashed border-red-300 rounded-xl flex items-center gap-3 transform -rotate-1">
                                <span className="text-xl">⚠️</span>
                                <Typography variant="caption" className="text-red-800 dark:text-red-200 font-bold font-patrick">{error}</Typography>
                            </div>
                        )}

                        {messages.length === 0 && !loading && (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <div className="text-5xl opacity-40 grayscale transform -rotate-12 animate-bounce">✍️</div>
                                <Typography variant="h3" className={`${COLORS.TEXT_SECONDARY} font-caveat opacity-70`}>
                                    Belum ada pesan. Jadilah yang pertama untuk mengatakan sesuatu!
                                </Typography>
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
                    </div>

                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />

                    {/* Scroll to bottom button */}
                    {showScrollToBottom && (
                        <button
                            onClick={scrollToBottom}
                            className="absolute bottom-6 right-6 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full p-3 shadow-lg border-2 border-dashed border-blue-400 dark:border-blue-700 transition-all duration-200 z-30"
                            title="Lihat pesan terbaru"
                        >
                            <div className="relative">
                                <svg className="w-6 h-6 transform rotate-180" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14l5-5 5 5z" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-4 -right-4 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white dark:border-gray-800">
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
            </Card>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <Card variant="glass" className="relative w-full max-w-md p-8 shadow-2xl overflow-hidden">
                        {/* Tape effect */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-red-100/80 dark:bg-red-900/30 rotate-1 shadow-sm z-20"></div>

                        <div className="relative z-10">
                            <Heading level={2} className={`${COLORS.TEXT_PRIMARY} mb-4 text-center`}>Hapus Semua Pesan?</Heading>
                            <Typography variant="body" className={`${COLORS.TEXT_SECONDARY} mb-8 text-center font-patrick`}>
                                Tindakan ini akan menghapus semua pesan anonim secara permanen.
                                Pesan yang sudah terkirim tidak dapat dikembalikan.
                            </Typography>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    onClick={() => setShowResetConfirm(false)}
                                    variant="glass"
                                    fullWidth
                                    className="font-patrick"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleDeleteAllMessages}
                                    disabled={loading}
                                    variant="danger"
                                    fullWidth
                                    className="font-patrick"
                                >
                                    {loading ? 'Menghapus...' : 'Ya, Hapus Semua'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>,
        document.body
    );
};

export default AnonymousChatModal;

