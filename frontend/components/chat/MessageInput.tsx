import React, { useState, useRef, useEffect, memo } from 'react';
import { Input, Button, Typography } from '../ui';
import { COLORS } from '../../utils/styles';

interface AnonymousMessage {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface ReplyingTo {
    id: string;
    sender_id: string;
    content: string;
}

interface MessageInputProps {
    onSendMessage: (content: string, replyToId?: string) => void;
    replyingTo: ReplyingTo | null;
    onCancelReply: () => void;
    isConnected: boolean;
    currentUserId: string;
    disabled?: boolean;
    placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = memo(({
    onSendMessage,
    replyingTo,
    onCancelReply,
    isConnected,
    currentUserId,
    disabled = false,
    placeholder = 'Tulis pesan...'
}) => {
    const [messageContent, setMessageContent] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when replying
    useEffect(() => {
        if (replyingTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyingTo]);

    const handleSend = () => {
        const content = messageContent.trim();
        if (!content) return;

        onSendMessage(content, replyingTo?.id);
        setMessageContent('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (e.key === 'Escape' && replyingTo) {
            onCancelReply();
        }
    };

    const getSenderLabel = (senderId: string) => {
        return senderId === currentUserId
            ? 'Anda'
            : `Anonim-${senderId.slice(-6)}`;
    };

    return (
        <div className={`p-4 border-t-2 border-dashed ${COLORS.BORDER} bg-white/90 dark:bg-black/40 backdrop-blur-sm relative z-20`}>
            {/* Reply Preview */}
            {replyingTo && (
                <div className={`flex items-start gap-3 mb-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border-l-4 border-dashed border-blue-400 transform -rotate-1 transition-transform`}>
                    <div className="flex-1 min-w-0">
                        <Typography variant="caption" className="font-bold text-blue-600 dark:text-blue-400 mb-1">
                            Membalas {getSenderLabel(replyingTo.sender_id)}
                        </Typography>
                        <Typography variant="caption" className={`${COLORS.TEXT_SECONDARY} truncate italic`}>
                            "{replyingTo.content}"
                        </Typography>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className={`${COLORS.TEXT_SECONDARY} hover:text-red-500 p-1 transition-colors`}
                        title="Batalkan balasan"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || !isConnected}
                        fullWidth
                        variant="glass"
                        className="font-patrick text-lg"
                    />
                </div>
                <Button
                    onClick={handleSend}
                    disabled={disabled || !messageContent.trim() || !isConnected}
                    variant="glass"
                    size="md"
                    className={`rounded-full shadow-sm ${isConnected ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border-blue-300 dark:border-blue-700' : ''}`}
                    title="Kirim pesan"
                >
                    <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </Button>
            </div>

            {/* Connection Status */}
            {!isConnected && (
                <div className="mt-2 text-center text-yellow-600 dark:text-yellow-400 text-sm font-patrick flex items-center justify-center gap-2">
                    <span className="animate-pulse">⚠️</span> Tidak terhubung ke server. Mencoba kembali...
                </div>
            )}
        </div>
    );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;

