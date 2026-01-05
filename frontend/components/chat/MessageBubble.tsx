import React, { memo } from 'react';
import { Typography, Text } from '../ui';
import { COLORS } from '../../utils/styles';

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
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 px-2`}>
            <div className={`flex flex-col max-w-[85%] sm:max-w-[70%]`}>
                <div
                    className={`relative p-4 shadow-sm border-2 ${isOwnMessage
                        ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-2xl rounded-tr-none rotate-1'
                        : 'bg-white/80 dark:bg-gray-800/80 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl rounded-tl-none -rotate-1'
                        } transition-transform hover:rotate-0`}
                >
                    {/* Sender Label */}
                    <Typography
                        variant="caption"
                        className={`mb-1 font-bold ${isOwnMessage ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        {getSenderLabel(message.sender_id)}
                    </Typography>

                    {/* Reply Preview */}
                    {message.reply_to_id && message.reply_content && (
                        <div
                            className={`text-xs p-3 mb-3 rounded-lg border-l-4 border-dashed ${isOwnMessage
                                ? 'bg-blue-100/30 border-blue-400 text-blue-800 dark:text-blue-200'
                                : 'bg-gray-100/50 border-gray-400 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <div className="font-bold opacity-80 mb-1">
                                {message.reply_sender_id === currentUserId
                                    ? 'Anda'
                                    : `Anonim-${message.reply_sender_id?.slice(-6)}`}
                            </div>
                            <div className="truncate italic opacity-70">
                                "{message.reply_content}"
                            </div>
                        </div>
                    )}

                    {/* Message Content */}
                    <Text className={`break-words ${COLORS.TEXT_PRIMARY} leading-relaxed font-patrick text-lg`}>
                        {message.content}
                    </Text>

                    {/* Timestamp */}
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <Typography variant="caption" className="opacity-40 italic font-caveat">
                            {formatTime(message.created_at)}
                        </Typography>
                    </div>

                    {/* Decorative Corner for Note Feel */}
                    <div className={`absolute top-0 ${isOwnMessage ? 'right-0' : 'left-0'} w-4 h-4`}>
                        <div className={`w-full h-full border-t-2 border-${isOwnMessage ? 'blue' : 'gray'}-200 dark:border-gray-700 opacity-20`}></div>
                    </div>
                </div>

                {/* Reply Button */}
                {!isOwnMessage && onReply && (
                    <button
                        onClick={() => onReply(message)}
                        className={`text-sm mt-1 ml-4 ${COLORS.TEXT_ACCENT} opacity-60 hover:opacity-100 hover:underline transition-all font-patrick`}
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

