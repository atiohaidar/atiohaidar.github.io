/**
 * Hook untuk mengelola message list dengan optimasi performa
 * - Memoization untuk grouping dan sorting
 * - Auto-scroll management
 * - Optimized re-renders
 */
import { useMemo, useRef, useCallback, useEffect, useState } from 'react';

interface Message {
    id: string;
    sender_id?: string;
    sender_username?: string;
    content: string;
    reply_to_id?: string;
    reply_content?: string;
    reply_sender_id?: string;
    reply_sender_name?: string;
    created_at: string;
}

interface DateGroup {
    dateKey: string;
    formattedDate: string;
    messages: Message[];
}

interface UseOptimizedMessagesOptions {
    messages: Message[];
    currentUserId?: string;
}

interface UseOptimizedMessagesResult {
    groupedMessages: DateGroup[];
    totalCount: number;
    scrollToBottom: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
    endRef: React.RefObject<HTMLDivElement>;
}

export function useOptimizedMessages({
    messages,
    currentUserId
}: UseOptimizedMessagesOptions): UseOptimizedMessagesResult {
    const containerRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const lastCountRef = useRef(0);

    // Format date header with memoization
    const formatDateHeader = useCallback((dateString: string): string => {
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

    // Group and sort messages - fully memoized
    const groupedMessages = useMemo<DateGroup[]>(() => {
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

        return Object.entries(groups)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([dateKey, dateMessages]) => ({
                dateKey,
                formattedDate: formatDateHeader(dateKey),
                messages: dateMessages.sort((a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
            }));
    }, [messages, formatDateHeader]);

    // Scroll to bottom function
    const scrollToBottom = useCallback(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        if (messages.length > lastCountRef.current) {
            // Small delay to ensure DOM is updated
            requestAnimationFrame(() => {
                scrollToBottom();
            });
        }
        lastCountRef.current = messages.length;
    }, [messages.length, scrollToBottom]);

    return {
        groupedMessages,
        totalCount: messages.length,
        scrollToBottom,
        containerRef,
        endRef
    };
}

/**
 * Hook untuk debounce input - mengurangi re-renders saat mengetik
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook untuk throttle - membatasi frekuensi eksekusi
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => clearTimeout(handler);
    }, [value, limit]);

    return throttledValue;
}

export default useOptimizedMessages;
