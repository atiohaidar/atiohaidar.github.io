import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../utils/styles';
import {
    getAnonymousMessages,
    sendAnonymousMessage,
    deleteAllAnonymousMessages,
    type AnonymousMessage,
} from '../services/chatService';
import { webSocketService } from '../services/websocketService';

const FullscreenAnonymousChatPage: React.FC = () => {
    const [messages, setMessages] = useState<AnonymousMessage[]>([]);
    const [messageContent, setMessageContent] = useState('');
    const [replyTo, setReplyTo] = useState<AnonymousMessage | null>(null);
    const [senderId, setSenderId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(1);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isUserScrollingRef = useRef(false);
    const lastMessageCountRef = useRef(0);

    // Generate or retrieve anonymous sender ID
    useEffect(() => {
        let storedId = localStorage.getItem('anonymous_sender_id');
        if (!storedId) {
            storedId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('anonymous_sender_id', storedId);
        }
        setSenderId(storedId);
    }, []);

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

    // WebSocket message handler
    const handleWebSocketMessage = useCallback((data: any) => {
        // Any message from server implies the socket is alive
        setIsConnected(true);

        if (data.type === 'welcome') {
            if (typeof data.connections === 'number') {
                setOnlineUsers(data.connections);
            }
            return;
        }

        if (data.type === 'connections_update') {
            if (typeof data.connections === 'number') {
                setOnlineUsers(data.connections);
            }
            return;
        }

        if (data.type === 'new_message') {
            setMessages(prev => {
                const exists = prev.some(msg => msg.id === data.message.id);
                if (exists) return prev;
                return [...prev, data.message];
            });
            setTimeout(() => scrollToBottom(), 100);
        } else if (data.type === 'clear_messages') {
            setMessages([]);
        }
    }, []);

    // Scroll functions
    const checkIfAtBottom = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return true;
        const threshold = 100;
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Handle user scroll
    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const isAtBottom = checkIfAtBottom();
        if (!isAtBottom && !isUserScrollingRef.current) {
            isUserScrollingRef.current = true;
        }
    }, [checkIfAtBottom]);

    const handleUserScrollStart = useCallback(() => {
        isUserScrollingRef.current = true;
    }, []);

    const handleUserScrollEnd = useCallback(() => {
        setTimeout(() => {
            isUserScrollingRef.current = false;
        }, 100);
    }, []);

    // Load initial messages and setup WebSocket
    useEffect(() => {
        if (!senderId) return;

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
            setIsConnected(false);
            if (container) {
                container.removeEventListener('scroll', handleScroll);
                container.removeEventListener('touchstart', handleUserScrollStart);
                container.removeEventListener('touchend', handleUserScrollEnd);
                container.removeEventListener('mousedown', handleUserScrollStart);
                container.removeEventListener('mouseup', handleUserScrollEnd);
            }
        };
    }, [senderId, handleWebSocketMessage, handleScroll, handleUserScrollStart, handleUserScrollEnd, scrollToBottom]);

    const handleSendMessage = async () => {
        if (!messageContent.trim() || !senderId) return;

        setError(null);
        try {
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

    const handleDeleteAllMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            await deleteAllAnonymousMessages();
            setMessages([]);
            setShowResetConfirm(false);
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

    return (
        <div className="min-h-screen bg-[#0a1014] text-white">
            <div className="bg-[#005c4b] p-4 border-b border-[#00695c]">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-white hover:text-gray-300 text-xl">←</Link>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                                💬
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold">Chat Anonim</h1>
                                <p className="text-sm text-white/80 flex items-center gap-2">
                                    Ruang chat publik • {onlineUsers} online
                                    <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                    {isConnected ? 'Terhubung' : 'Mencoba menghubungkan...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            disabled={loading || messages.length === 0}
                            className="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            title="Hapus semua pesan"
                        >
                            🗑️ Reset Chat
                        </button>
                        <button
                            onClick={loadMessages}
                            disabled={loading}
                            className="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 text-sm"
                            title="Muat ulang pesan"
                        >
                            {loading ? '⟳' : '🔄'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex max-w-6xl mx-auto h-[calc(100vh-80px)]">
                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto p-6 space-y-2"
                    >
                        {error && (
                            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        {messages.length === 0 && !loading && (
                            <div className="text-center text-gray-400 py-12">
                                <div className="text-6xl mb-4">💬</div>
                                <div className="text-xl mb-2">Belum ada pesan</div>
                                <p className="text-sm">Jadilah yang pertama untuk mengatakan sesuatu!</p>
                            </div>
                        )}

                        {messages.length > 0 && Object.entries(groupMessagesByDate(messages))
                            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                            .map(([dateKey, dateMessages]) => (
                            <div key={dateKey}>
                                {/* Date Header */}
                                <div className="flex items-center justify-center my-6">
                                    <div className="bg-[#1f2c34] text-gray-300 text-xs px-4 py-2 rounded-full border border-[#2a3942]">
                                        {formatDateHeader(dateKey)}
                                    </div>
                                </div>

                                {/* Messages for this date */}
                                {dateMessages
                                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                    .map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_id === senderId ? 'justify-end' : 'justify-start'} mb-2`}
                                    >
                                        <div className="flex flex-col max-w-[70%]">
                                            <div
                                                className={`relative p-3 px-4 shadow-sm ${
                                                    msg.sender_id === senderId
                                                        ? 'bg-[#005c4b] text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                                                        : 'bg-[#1f2c34] text-gray-100 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                                }`}
                                            >
                                                <div className="text-sm mb-1 opacity-70 font-medium">
                                                    {msg.sender_id === senderId ? 'Anda' : `Anonim-${msg.sender_id.slice(-6)}`}
                                                </div>
                                                {msg.reply_to_id && msg.reply_content && (
                                                    <div className={`text-xs p-3 mb-3 rounded border-l-4 ${msg.sender_id === senderId ? 'bg-[#004a3d] border-[#00a884]' : 'bg-[#182229] border-[#00a884]'}`}>
                                                        <div className="font-medium text-[#00a884] mb-1">
                                                            {msg.reply_sender_id === senderId ? 'Anda' : `Anonim-${msg.reply_sender_id?.slice(-6)}`}
                                                        </div>
                                                        <div className="truncate opacity-80">{msg.reply_content}</div>
                                                    </div>
                                                )}
                                                <div className="break-words text-base leading-relaxed">
                                                    {msg.content}
                                                </div>
                                                <div className="flex items-center justify-end gap-2 mt-2">
                                                    <span className="text-xs opacity-60">
                                                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            {msg.sender_id !== senderId && (
                                                <button
                                                    onClick={() => handleReply(msg)}
                                                    className="text-xs mt-1 ml-4 text-gray-400 hover:text-[#00a884] hover:underline transition-colors"
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
                    </div>

                    {/* Message Input */}
                    <div className="p-6 bg-[#1f2c34] border-t border-[#2a3942]">
                        {replyTo && (
                            <div className="mb-4 p-3 rounded-lg bg-[#2a3942] flex justify-between items-start border-l-4 border-[#00a884]">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-[#00a884] mb-1">
                                        Membalas {replyTo.sender_id === senderId ? 'Anda' : `Anonim-${replyTo.sender_id.slice(-6)}`}
                                    </div>
                                    <div className="text-sm truncate opacity-80 text-gray-300">{replyTo.content}</div>
                                </div>
                                <button
                                    onClick={cancelReply}
                                    className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 items-center">
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
                                className="flex-1 px-4 py-3 rounded-full bg-[#2a3942] text-white focus:ring-2 focus:ring-[#00a884] focus:outline-none text-base"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageContent.trim() || loading}
                                className="p-3 rounded-full bg-[#00a884] text-white hover:bg-[#008069] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Kirim"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>

                        <div className="text-xs text-gray-400 mt-3 flex items-center justify-between">
                            <span>Pesan Anda bersifat anonim. ID Anda: <span className="font-mono text-[#00a884]">Anonim-{senderId.slice(-6)}</span></span>
                            <span>{messages.length} pesan total</span>
                        </div>
                    </div>
                </div>

                {/* Online Users Sidebar */}
                <div className="w-64 bg-[#1f2c34] border-l border-[#2a3942] flex flex-col">
                    <div className="p-4 border-b border-[#2a3942]">
                        <h3 className="text-lg font-semibold text-white mb-2">Pengguna Online</h3>
                        <p className="text-sm text-gray-400">{onlineUsers} pengguna aktif</p>
                    </div>

                    <div className="flex-1 p-4">
                        <div className="space-y-3">
                            {/* Current user */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#005c4b] border border-[#00695c]">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                                    👤
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">Anda</div>
                                    <div className="text-xs text-green-400">Online</div>
                                </div>
                            </div>

                            {/* Other users */}
                            {Array.from({ length: Math.max(0, onlineUsers - 1) }, (_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#2a3942] border border-[#37474f]">
                                    <div className="w-8 h-8 rounded-full bg-[#00a884]/20 flex items-center justify-center text-[#00a884] font-bold text-sm">
                                        {['😊', '🤔', '😄', '🤗', '😎'][i % 5]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-200">Anonim-{String(i + 1).padStart(3, '0')}</div>
                                        <div className="text-xs text-green-400">Online</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {onlineUsers <= 1 && (
                            <div className="text-center text-gray-500 mt-8">
                                <div className="text-3xl mb-2">👥</div>
                                <div className="text-sm">Belum ada pengguna lain</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-[#1f2c34] border border-[#2a3942] relative w-full max-w-md rounded-xl p-6 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            aria-label="Tutup konfirmasi"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-white">
                            Hapus Semua Pesan?
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Tindakan ini akan menghapus semua pesan anonim secara permanen.
                            Pesan yang sudah terkirim tidak dapat dikembalikan.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 px-4 py-3 rounded-lg font-semibold border border-[#2a3942] text-white hover:bg-black/20 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAllMessages}
                                disabled={loading}
                                className="flex-1 px-4 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default FullscreenAnonymousChatPage;
