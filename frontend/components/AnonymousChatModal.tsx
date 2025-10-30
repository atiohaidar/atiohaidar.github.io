import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COLORS } from '../utils/styles';
import {
    getAnonymousMessages,
    sendAnonymousMessage,
    deleteAllAnonymousMessages,
    type AnonymousMessage,
} from '../services/chatService';
import { webSocketService } from '../services/websocketService';

interface AnonymousChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AnonymousChatModal: React.FC<AnonymousChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<AnonymousMessage[]>([]);
    const [messageContent, setMessageContent] = useState('');
    const [replyTo, setReplyTo] = useState<AnonymousMessage | null>(null);
    const [senderId, setSenderId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isUserScrollingRef = useRef(false);
    const lastMessageCountRef = useRef(0);

    useEffect(() => {
        // Generate or retrieve anonymous sender ID
        let storedId = localStorage.getItem('anonymous_sender_id');
        if (!storedId) {
            storedId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('anonymous_sender_id', storedId);
        }
        setSenderId(storedId);
    }, []);

    // Handle WebSocket messages
    const handleWebSocketMessage = useCallback((data: any) => {
        if (data.type === 'new_message') {
            setMessages(prev => {
                // Check if message already exists to avoid duplicates
                const exists = prev.some(msg => msg.id === data.message.id);
                if (exists) return prev;

                const newMessages = [...prev, data.message];
                const isAtBottom = checkIfAtBottom();

                // Auto-scroll if user is at bottom, otherwise increment unread count
                if (isAtBottom) {
                    setTimeout(() => scrollToBottom(), 100);
                } else {
                    setUnreadCount(prev => prev + 1);
                }

                return newMessages;
            });
        } else if (data.type === 'welcome') {
            setIsConnected(true);
            console.log(`Connected to chat room. ${data.connections} users online.`);
        } else if (data.type === 'connections_update') {
            console.log(`${data.connections} users online.`);
        } else if (data.type === 'error') {
            setError(data.message);
        }
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

    useEffect(() => {
        if (isOpen) {
            // Load initial messages
            const loadInitialMessages = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getAnonymousMessages();
                    // Reverse to show oldest first, newest at bottom
                    setMessages(data);
                    // Scroll to bottom after messages load
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

    const handleSendMessage = async () => {
        if (!messageContent.trim() || !senderId) return;

        setError(null);
        try {
            // Try WebSocket first
            if (webSocketService.isConnected) {
                webSocketService.sendMessage({
                    type: 'send_message',
                    sender_id: senderId,
                    content: messageContent.trim(),
                    reply_to_id: replyTo?.id
                });

                setMessageContent('');
                setReplyTo(null);
            } else {
                // Fallback to REST API
                console.log('WebSocket not connected, using REST API fallback');
                const data: any = {
                    sender_id: senderId,
                    content: messageContent.trim(),
                };

                if (replyTo) {
                    data.reply_to_id = replyTo.id;
                }

                await sendAnonymousMessage(data);
                setMessageContent('');
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
            // Scroll to bottom after loading messages
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className={`p-3 ${COLORS.BORDER_ACCENT} flex justify-between items-center bg-[#00a884]`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                            💬
                        </div>
                        <div>
                            <h2 className={`text-base font-medium text-white`}>Chat Anonim</h2>
                            <p className="text-xs text-white/80 flex items-center gap-2">
                                Ruang chat publik
                                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                {isConnected ? 'Terhubung' : 'Mencoba menghubungkan...'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            disabled={loading || messages.length === 0}
                            className={`p-2 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Hapus semua pesan"
                        >
                            🗑️
                        </button>
                        <button
                            onClick={loadMessages}
                            disabled={loading}
                            className={`p-2 rounded-full text-white hover:bg-white/10 transition-colors disabled:opacity-50`}
                            title="Muat ulang pesan"
                        >
                            {loading ? '⟳' : '🔄'}
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full text-white hover:bg-white/10 transition-colors`}
                            title="Tutup"
                        >
                            ✕
                        </button>
                    </div>
                </div>

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
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // Sort by date ascending
                        .map(([dateKey, dateMessages]) => (
                        <div key={dateKey}>
                            {/* Date Header */}
                            <div className="flex items-center justify-center my-4">
                                <div className="bg-[#1f2c34] text-gray-300 text-xs px-3 py-1 rounded-full border border-[#2a3942]">
                                    {formatDateHeader(dateKey)}
                                </div>
                            </div>
                            
                            {/* Messages for this date */}
                            {dateMessages
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                .map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_id === senderId ? 'justify-end' : 'justify-start'} mb-1`}
                                >
                                    <div className="flex flex-col max-w-[70%]">
                                        <div
                                            className={`relative p-2 px-3 shadow-sm ${
                                                msg.sender_id === senderId
                                                    ? 'bg-[#005c4b] text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                                                    : 'bg-[#1f2c34] text-gray-100 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                            }`}
                                        >
                                            <div className="text-xs mb-1 opacity-70">
                                                {msg.sender_id === senderId ? 'Anda' : `Anonim-${msg.sender_id.slice(-6)}`}
                                            </div>
                                            {msg.reply_to_id && msg.reply_content && (
                                                <div className={`text-xs p-2 mb-2 rounded border-l-4 ${msg.sender_id === senderId ? 'bg-[#004a3d] border-[#00a884]' : 'bg-[#182229] border-[#00a884]'}`}>
                                                    <div className="font-medium text-[#00a884]">
                                                        {msg.reply_sender_id === senderId ? 'Anda' : `Anonim-${msg.reply_sender_id?.slice(-6)}`}
                                                    </div>
                                                    <div className="truncate opacity-80">{msg.reply_content}</div>
                                                </div>
                                            )}
                                            <div className="break-words">
                                                {msg.content}
                                            </div>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] opacity-60">
                                                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        {msg.sender_id !== senderId && (
                                            <button
                                                onClick={() => handleReply(msg)}
                                                className="text-[10px] mt-1 ml-3 text-gray-400 hover:underline"
                                            >
                                                Balas
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                    
                    {/* Scroll to bottom button */}
                    {showScrollToBottom && (
                        <button
                            onClick={scrollToBottom}
                            className="fixed bottom-24 right-6 bg-[#00a884] hover:bg-[#008069] text-white rounded-full p-3 shadow-lg transition-all duration-200 z-10"
                            title="Lihat pesan terbaru"
                        >
                            <div className="relative">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14l5-5 5 5z"/>
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

                {/* Message Input */}
                <div className={`p-3 ${COLORS.BORDER_ACCENT} bg-[#1f2c34]`}>
                    {replyTo && (
                        <div className={`mb-2 p-2 rounded-lg bg-[#2a3942] flex justify-between items-start border-l-4 border-[#00a884]`}>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-[#00a884]">
                                    Membalas {replyTo.sender_id === senderId ? 'Anda' : `Anonim-${replyTo.sender_id.slice(-6)}`}
                                </div>
                                <div className="text-sm truncate opacity-80 text-gray-300">{replyTo.content}</div>
                            </div>
                            <button
                                onClick={cancelReply}
                                className="ml-2 text-gray-400 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ketik pesan anonim Anda..."
                            className={`flex-1 px-4 py-3 rounded-full bg-[#2a3942] text-white focus:ring-2 focus:ring-[#00a884] focus:outline-none`}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageContent.trim() || loading}
                            className={`p-3 rounded-full bg-[#00a884] text-white hover:bg-[#008069] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Kirim"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    <div className={`text-xs text-gray-400 mt-2`}>
                        Pesan Anda bersifat anonim. ID Anda: Anonim-{senderId.slice(-6)}
                    </div>
                </div>
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
        </div>
    );
};

export default AnonymousChatModal;
