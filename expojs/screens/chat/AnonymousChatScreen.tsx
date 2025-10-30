import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ActivityIndicator, FAB, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import ApiService from '@/services/api';
import { AnonymousMessage } from '@/types/api';
import { useTheme } from '@/hooks/useTheme';

import { MessageItem } from '@/components/chat/MessageItem';
import { MessageInput } from '@/components/chat/MessageInput';
import { ConnectionStatus } from '@/components/chat/ConnectionStatus';

const STORAGE_KEY = '@anonymous_sender_id';

export default function AnonymousChatScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    isConnected,
    connect,
    disconnect,
    sendAnonymousMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useWebSocket();

  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<AnonymousMessage | null>(null);
  const [senderId, setSenderId] = useState<string>('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isUserScrollingRef = useRef(false);

  // Generate or retrieve anonymous sender ID
  useEffect(() => {
    const initializeSenderId = async () => {
      try {
        let storedId = await AsyncStorage.getItem(STORAGE_KEY);
        if (!storedId) {
          storedId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem(STORAGE_KEY, storedId);
        }
        setSenderId(storedId);
      } catch (error) {
        console.error('Failed to initialize sender ID:', error);
      }
    };

    initializeSenderId();
  }, []);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const data = await ApiService.getAnonymousMessages();
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMessages().finally(() => setLoading(false));
  }, [loadMessages]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'new_message' && data.message) {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) return prev;

        const newMessages = [...prev, data.message];
        // Auto-scroll if user is not scrolling
        if (!isUserScrollingRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
        return newMessages;
      });
    }
  }, []);

  // Subscribe to WebSocket messages
  useEffect(() => {
    if (isConnected) {
      subscribeToMessages(handleWebSocketMessage);
    }

    return () => {
      unsubscribeFromMessages(handleWebSocketMessage);
    };
  }, [isConnected, handleWebSocketMessage, subscribeToMessages, unsubscribeFromMessages]);

  // Connect to WebSocket
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  // Handle send message
  const handleSendMessage = useCallback(
    (content: string, replyToId?: string) => {
      if (!isConnected) {
        Alert.alert('Disconnected', 'Please check your connection and try again.');
        return;
      }

      sendAnonymousMessage(content, replyToId);
      setReplyTo(null);
    },
    [isConnected, sendAnonymousMessage]
  );

  // Handle reply
  const handleReply = useCallback((message: AnonymousMessage) => {
    setReplyTo(message);
  }, []);

  // Handle cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  // Handle scroll to bottom
  const handleScrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setShowScrollToBottom(false);
  }, []);

  // Handle scroll events
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

    setShowScrollToBottom(!isAtBottom);
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    isUserScrollingRef.current = true;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    isUserScrollingRef.current = false;
  }, []);

  // Check if message is from current user
  const isCurrentUser = useCallback(
    (message: AnonymousMessage) => {
      return message.sender_id === senderId;
    },
    [senderId]
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color={colors.surface} />
        <Appbar.Content
          title="Anonymous Chat"
          subtitle="Chat anonymously with others"
          color={colors.surface}
        />
      </Appbar.Header>

      {/* Connection Status */}
      <ConnectionStatus showDetails />

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            onReply={handleReply}
            isCurrentUser={isCurrentUser(item)}
          />
        )}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContainer,
          { paddingBottom: insets.bottom + 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        showsVerticalScrollIndicator={false}
      />

      {/* Scroll to Bottom FAB */}
      {showScrollToBottom && (
        <FAB
          icon="chevron-down"
          onPress={handleScrollToBottom}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          color={colors.surface}
          size="small"
        />
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        disabled={!isConnected}
        placeholder={
          isConnected
            ? 'Type your anonymous message...'
            : 'Connecting to chat...'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 80,
  },
});
