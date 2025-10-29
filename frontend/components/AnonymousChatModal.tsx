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
            <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col`}>
                {/* Header */}
                <div className={`p-4 ${COLORS.BORDER_PRIMARY} flex justify-between items-center`}>
                    <h2 className={`text-xl font-bold ${COLORS.TEXT_ACCENT}`}>💬 Anonymous Chat</h2>
                    <button
                        onClick={onClose}
                        className={`${COLORS.TEXT_ACCENT} hover:text-red-500 text-2xl font-bold`}
                    >
                        ×
                    </button>
                </div>

                {/* Refresh Button */}
                <div className="px-4 py-2">
                    <button
                        onClick={loadMessages}
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ACCENT} hover:opacity-90 transition-opacity disabled:opacity-50`}
                    >
                        {loading ? '⟳ Refreshing...' : '🔄 Refresh Messages'}
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {error && (
                        <div className="bg-red-500 text-white p-3 rounded">
                            {error}
                        </div>
                    )}
                    {messages.length === 0 && !loading && (
                        <div className={`text-center ${COLORS.TEXT_MUTED} py-8`}>
                            No messages yet. Be the first to say something!
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === senderId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-md p-3 rounded-lg ${
                                    msg.sender_id === senderId
                                        ? 'bg-blue-600 text-white'
                                        : COLORS.BG_TERTIARY
                                }`}
                            >
                                <div className="text-xs mb-1 opacity-70">
                                    {msg.sender_id === senderId ? 'You' : `Anon-${msg.sender_id.slice(-6)}`}
                                </div>
                                {msg.reply_to_id && msg.reply_content && (
                                    <div className={`text-xs p-2 mb-2 rounded ${msg.sender_id === senderId ? 'bg-black bg-opacity-20' : 'bg-gray-700'}`}>
                                        <div className="font-medium">
                                            {msg.reply_sender_id === senderId ? 'You' : `Anon-${msg.reply_sender_id?.slice(-6)}`}
                                        </div>
                                        <div className="truncate">{msg.reply_content}</div>
                                    </div>
                                )}
                                <div className={msg.sender_id === senderId ? 'text-white' : COLORS.TEXT_ACCENT}>
                                    {msg.content}
                                </div>
                                <div className="text-xs mt-1 opacity-70">
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                </div>
                                {msg.sender_id !== senderId && (
                                    <button
                                        onClick={() => handleReply(msg)}
                                        className="text-xs mt-1 hover:underline"
                                    >
                                        Reply
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className={`p-4 ${COLORS.BORDER_PRIMARY}`}>
                    {replyTo && (
                        <div className={`mb-2 p-2 rounded ${COLORS.BG_TERTIARY} flex justify-between items-start`}>
                            <div className="flex-1">
                                <div className="text-sm font-medium">
                                    Replying to {replyTo.sender_id === senderId ? 'You' : `Anon-${replyTo.sender_id.slice(-6)}`}
                                </div>
                                <div className="text-sm truncate">{replyTo.content}</div>
                            </div>
                            <button
                                onClick={cancelReply}
                                className="ml-2 text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2">
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
                            placeholder="Type your anonymous message..."
                            className={`flex-1 px-4 py-2 rounded ${COLORS.BG_TERTIARY} ${COLORS.TEXT_ACCENT} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageContent.trim() || loading}
                            className={`py-2 px-6 rounded ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ACCENT} hover:opacity-90 transition-opacity disabled:opacity-50`}
                        >
                            Send
                        </button>
                    </div>
                    <div className={`text-xs ${COLORS.TEXT_MUTED} mt-2`}>
                        Your messages are anonymous. Your ID: Anon-{senderId.slice(-6)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnonymousChatModal;
