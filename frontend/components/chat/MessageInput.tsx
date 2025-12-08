import React, { useState, useRef, useEffect, memo } from 'react';

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
        <div className="p-4 border-t border-[#2a3942] bg-[#0e1418]">
            {/* Reply Preview */}
            {replyingTo && (
                <div className="flex items-start gap-3 mb-3 p-3 bg-[#1a2228] rounded-lg border-l-4 border-[#3B82F6]">
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#60A5FA] mb-1">
                            Membalas {getSenderLabel(replyingTo.sender_id)}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                            {replyingTo.content}
                        </div>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="text-gray-400 hover:text-white p-1 transition-colors"
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
                <input
                    ref={inputRef}
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 bg-[#1a2228] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !messageContent.trim()}
                    className="p-3 rounded-full bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Kirim pesan"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>

            {/* Connection Status */}
            {!isConnected && (
                <div className="mt-2 text-center text-yellow-400 text-sm">
                    ⚠️ Tidak terhubung ke server
                </div>
            )}
        </div>
    );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
