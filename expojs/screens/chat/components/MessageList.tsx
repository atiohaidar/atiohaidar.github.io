import React, { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import type { Message } from '@/types/api';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onReload: () => void;
  currentUsername?: string;
  currentSenderId?: string; // For anonymous chat
  scrollRef?: RefObject<ScrollView | null>;
}

export function MessageList({ messages, loading, onReload, currentUsername, currentSenderId, scrollRef }: MessageListProps) {
  const fallbackRef = useRef<ScrollView | null>(null);
  const ref = useMemo(() => scrollRef ?? fallbackRef, [scrollRef]);

  // Sort messages so newest is at the bottom
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeA - timeB; // Ascending order (oldest first, newest last)
    });
  }, [messages]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      ref.current?.scrollToEnd({ animated: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [loading, messages, ref]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Refreshing messages…</Text>
        </View>
      ) : sortedMessages.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No messages yet. Say hello!</Text>
        </View>
      ) : (
        <ScrollView
          ref={ref}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onReload} />}
        >
          {sortedMessages.map((msg) => {
            // Check if message is from current user
            // For anonymous chat, use sender_id; for regular chat, use sender_username
            const isOwn = msg.sender_id 
              ? msg.sender_id === currentSenderId
              : msg.sender_username === currentUsername;
            
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  contentContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#6c6c6c',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    color: '#6c6c6c',
  },
});
