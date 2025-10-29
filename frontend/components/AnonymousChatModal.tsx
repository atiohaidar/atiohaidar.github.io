import React, { useState, useEffect } from 'react';
import { COLORS } from '../utils/styles';
import {
    getAnonymousMessages,
    sendAnonymousMessage,
    type AnonymousMessage,
} from '../services/chatService';

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

    useEffect(() => {
        // Generate or retrieve anonymous sender ID
        let storedId = localStorage.getItem('anonymous_sender_id');
        if (!storedId) {
            storedId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('anonymous_sender_id', storedId);
        }
        setSenderId(storedId);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadMessages();
        }
    }, [isOpen]);

    const loadMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAnonymousMessages();
            // Reverse to show newest at bottom
            setMessages(data.reverse());
        } catch (err: any) {
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageContent.trim() || !senderId) return;

        setError(null);
        try {
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
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
        }
    };

    const handleReply = (message: AnonymousMessage) => {
        setReplyTo(message);
    };

    const cancelReply = () => {
        setReplyTo(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className={`p-3 ${COLORS.BORDER_PRIMARY} flex justify-between items-center bg-[#00a884]`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                            💬
                        </div>
                        <div>
                            <h2 className={`text-base font-medium text-white`}>Chat Anonim</h2>
                            <p className="text-xs text-white/80">Ruang chat publik</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0a1014]">
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
                    {messages.map((msg) => (
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

                {/* Message Input */}
                <div className={`p-3 ${COLORS.BORDER_PRIMARY} bg-[#1f2c34]`}>
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
        </div>
    );
};

export default AnonymousChatModal;
