import React, { memo } from 'react';

interface AnonymousMessage {
    id: string;
    sender_id: string;
    content: string;
    reply_to_id?: string;
    reply_content?: string;
    reply_sender_id?: string;
    created_at: string;
}

interface MessageBubbleProps {
    message: AnonymousMessage;
    isOwnMessage: boolean;
    currentUserId: string;
    onReply?: (message: AnonymousMessage) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = memo(({
    message,
    isOwnMessage,
    currentUserId,
    onReply
}) => {
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSenderLabel = (senderId: string) => {
        return senderId === currentUserId
            ? 'Anda'
            : `Anonim-${senderId.slice(-6)}`;
    };

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className="flex flex-col max-w-[70%]">
                <div
                    className={`relative p-3 px-4 shadow-sm ${isOwnMessage
                            ? 'bg-[#1D4ED8] text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                            : 'bg-[#1f2c34] text-gray-100 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                        }`}
                >
                    {/* Sender Label */}
                    <div className="text-sm mb-1 opacity-70 font-medium">
                        {getSenderLabel(message.sender_id)}
                    </div>

                    {/* Reply Preview */}
                    {message.reply_to_id && message.reply_content && (
                        <div
                            className={`text-xs p-3 mb-3 rounded border-l-4 ${isOwnMessage
                                    ? 'bg-[#1E40AF] border-[#3B82F6]'
                                    : 'bg-[#182229] border-[#3B82F6]'
                                }`}
                        >
                            <div className="font-medium text-[#60A5FA] mb-1">
                                {message.reply_sender_id === currentUserId
                                    ? 'Anda'
                                    : `Anonim-${message.reply_sender_id?.slice(-6)}`}
                            </div>
                            <div className="truncate opacity-80">
                                {message.reply_content}
                            </div>
                        </div>
                    )}

                    {/* Message Content */}
                    <div className="break-words text-base leading-relaxed">
                        {message.content}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <span className="text-xs opacity-60">
                            {formatTime(message.created_at)}
                        </span>
                    </div>
                </div>

                {/* Reply Button */}
                {!isOwnMessage && onReply && (
                    <button
                        onClick={() => onReply(message)}
                        className="text-xs mt-1 ml-4 text-gray-400 hover:text-[#60A5FA] hover:underline transition-colors"
                    >
                        Balas
                    </button>
                )}
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
