/**
 * Virtual Message List Component
 * Uses @tanstack/react-virtual for efficient rendering of large message lists
 * Only renders messages visible in the viewport, drastically improving performance
 * for chat rooms with 1000+ messages
 */
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import MessageBubble from './chat/MessageBubble';
import DateSeparator from './chat/DateSeparator';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    reply_to_id?: string;
    reply_content?: string;
    reply_sender_id?: string;
    created_at: string;
}

interface DateGroup {
    dateKey: string;
    messages: Message[];
}

interface VirtualMessageListProps {
    messages: Message[];
    currentUserId: string;
    onReply: (message: Message) => void;
    formatDateHeader: (dateKey: string) => string;
    className?: string;
}

// Virtual item can be either a date header or a message
type VirtualItem =
    | { type: 'date-header'; dateKey: string; formattedDate: string }
    | { type: 'message'; message: Message; isOwn: boolean };

const VirtualMessageList: React.FC<VirtualMessageListProps> = ({
    messages,
    currentUserId,
    onReply,
    formatDateHeader,
    className = ''
}) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const lastMessageCount = useRef(0);

    // Group messages by date and create flat virtual items list
    const virtualItems = useMemo<VirtualItem[]>(() => {
        if (messages.length === 0) return [];

        const groups: { [date: string]: Message[] } = {};

        messages.forEach(msg => {
            const date = new Date(msg.created_at);
            const dateKey = date.toISOString().split('T')[0];
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });

        const items: VirtualItem[] = [];

        Object.entries(groups)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .forEach(([dateKey, dateMessages]) => {
                // Add date header
                items.push({
                    type: 'date-header',
                    dateKey,
                    formattedDate: formatDateHeader(dateKey)
                });

                // Add messages sorted by time
                dateMessages
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .forEach(message => {
                        items.push({
                            type: 'message',
                            message,
                            isOwn: message.sender_id === currentUserId
                        });
                    });
            });

        return items;
    }, [messages, currentUserId, formatDateHeader]);

    const virtualizer = useVirtualizer({
        count: virtualItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            const item = virtualItems[index];
            if (item.type === 'date-header') return 60; // Date headers are smaller
            // Estimate message height based on content length
            const messageLength = item.message.content.length;
            const hasReply = !!item.message.reply_to_id;
            const baseHeight = 80;
            const replyHeight = hasReply ? 50 : 0;
            const extraLines = Math.floor(messageLength / 50) * 20;
            return Math.min(baseHeight + replyHeight + extraLines, 300);
        },
        overscan: 10, // Render 10 extra items above/below viewport
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > lastMessageCount.current) {
            requestAnimationFrame(() => {
                virtualizer.scrollToIndex(virtualItems.length - 1, {
                    align: 'end',
                    behavior: 'smooth'
                });
            });
        }
        lastMessageCount.current = messages.length;
    }, [messages.length, virtualItems.length, virtualizer]);

    // Initial scroll to bottom
    useEffect(() => {
        if (virtualItems.length > 0) {
            virtualizer.scrollToIndex(virtualItems.length - 1, { align: 'end' });
        }
    }, []);

    const renderItem = useCallback((item: VirtualItem) => {
        if (item.type === 'date-header') {
            return <DateSeparator dateLabel={item.formattedDate} />;
        }

        const msg = item.message;
        const isOwn = item.isOwn;

        return (
            <MessageBubble
                message={{
                    // Map Message to AnonymousMessage interface expected by MessageBubble
                    // Assuming types are compatible or mapping is needed
                    id: msg.id,
                    sender_id: msg.sender_id,
                    content: msg.content,
                    reply_to_id: msg.reply_to_id,
                    reply_content: msg.reply_content,
                    reply_sender_id: msg.reply_sender_id,
                    created_at: msg.created_at
                }}
                isOwnMessage={isOwn}
                currentUserId={currentUserId}
                onReply={() => onReply(msg)}
            />
        );
    }, [currentUserId, onReply]);

    if (messages.length === 0) {
        return (
            <div className={`flex items-center justify-center h-full ${className}`}>
                <div className="text-center text-gray-400 py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <div className="text-xl mb-2">Belum ada pesan</div>
                    <p className="text-sm">Jadilah yang pertama untuk mengatakan sesuatu!</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            className={`overflow-auto ${className}`}
            style={{ contain: 'strict' }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const item = virtualItems[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="px-6"
                        >
                            {renderItem(item)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VirtualMessageList;
