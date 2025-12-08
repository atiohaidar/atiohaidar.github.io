import React, { memo } from 'react';

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3942] bg-gradient-to-r from-[#1a1f25] to-[#0e1418]">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-xl shadow-lg">
                        💬
                    </div>
                    {/* Connection Indicator */}
                    <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0e1418] ${isConnected
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-yellow-500'
                            }`}
                        title={isConnected ? 'Terhubung' : 'Menghubungkan...'}
                    />
                </div>

                {/* Title & Status */}
                <div>
                    <h2 className="text-lg font-bold text-white">
                        {title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className={isConnected ? 'text-green-400' : 'text-yellow-400'}>
                            {isConnected ? '● Online' : '○ Menghubungkan...'}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span>{onlineUsers} pengguna aktif</span>
                    </div>
                </div>
            </div>


            {/* Actions & Close Button */}
            <div className="flex items-center gap-2">
                {actions}

                {showCloseButton && onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#1a2228] rounded-full transition-all"
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
