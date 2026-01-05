import React, { memo } from 'react';
import { Heading, Typography } from '../ui';
import { COLORS } from '../../utils/styles';

interface ChatHeaderProps {
    onlineUsers: number;
    isConnected: boolean;
    onClose?: () => void;
    showCloseButton?: boolean;
    title?: string;
    actions?: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = memo(({
    onlineUsers,
    isConnected,
    onClose,
    showCloseButton = true,
    title = 'Chat Anonim',
    actions
}) => {
    return (
        <div className={`flex items-center justify-between px-6 py-4 border-b-2 border-dashed ${COLORS.BORDER} bg-white/80 dark:bg-black/20 backdrop-blur-md`}>
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className={`w-12 h-12 rounded-full border-2 border-dashed ${COLORS.BORDER} bg-white dark:bg-gray-800 flex items-center justify-center text-xl shadow-sm transform hover:rotate-12 transition-transform`}>
                        💬
                    </div>
                    {/* Connection Indicator */}
                    <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${COLORS.BORDER} ${isConnected
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-yellow-500'
                            }`}
                        title={isConnected ? 'Terhubung' : 'Menghubungkan...'}
                    />
                </div>

                {/* Title & Status */}
                <div>
                    <Heading level={3} className={`${COLORS.TEXT_PRIMARY}`}>
                        {title}
                    </Heading>
                    <div className="flex items-center gap-2 font-patrick">
                        <Typography
                            variant="caption"
                            className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}
                        >
                            {isConnected ? '● Online' : '○ Menghubungkan...'}
                        </Typography>
                        <span className={`${COLORS.TEXT_SECONDARY} opacity-50`}>•</span>
                        <Typography variant="caption" className={`${COLORS.TEXT_SECONDARY}`}>
                            {onlineUsers} pengguna aktif
                        </Typography>
                    </div>
                </div>
            </div>


            {/* Actions & Close Button */}
            <div className="flex items-center gap-2">
                {actions}

                {showCloseButton && onClose && (
                    <button
                        onClick={onClose}
                        className={`p-2 ${COLORS.TEXT_SECONDARY} hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all`}
                        title="Tutup"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;

