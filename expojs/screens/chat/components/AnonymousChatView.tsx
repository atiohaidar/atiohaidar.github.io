import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
  Chip,
  Surface,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { webSocketService } from '@/services/websocketService';
import ApiService from '@/services/api';
import { AnonymousMessage } from '@/types/api';

const SENDER_ID_KEY = '@anonymous_sender_id';

export function AnonymousChatView() {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [senderId, setSenderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<AnonymousMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);
  const isUserScrolling = useRef(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Initialize sender ID
  useEffect(() => {
    const initSenderId = async () => {
      try {
        let id = await AsyncStorage.getItem(SENDER_ID_KEY);
        if (!id) {
          id = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem(SENDER_ID_KEY, id);
        }
        setSenderId(id);
      } catch (error) {
        console.error('Failed to initialize sender ID:', error);
      }
    };

    initSenderId();
  }, []);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await ApiService.listAnonymousMessages();
        setMessages(data);
        setLoading(false);
        // Scroll to bottom after loading
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      } catch (error) {
        console.error('Failed to load messages:', error);
        Alert.alert('Error', 'Failed to load messages');
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Setup WebSocket
  useEffect(() => {
    webSocketService.ensureConnected();

    const handleWebSocketMessage = (data: any) => {
      if (data.type === 'welcome') {
        setConnected(true);
        setConnectionCount(data.connections || 0);
        console.log('[Anonymous Chat] Connected, connections:', data.connections);
      } else if (data.type === 'connections_update') {
        setConnectionCount(data.connections || 0);
      } else if (data.type === 'new_message') {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((msg) => msg.id === data.message.id);
          if (exists) return prev;

          const newMessages = [...prev, data.message];
          
          // Auto-scroll if user is near bottom
          if (!isUserScrolling.current) {
            setTimeout(() => scrollToBottom(true), 100);
          } else {
            setShowScrollToBottom(true);
          }

          return newMessages;
        });
      }
    };

    webSocketService.onMessage(handleWebSocketMessage);

    // Cleanup
    return () => {
      webSocketService.offMessage(handleWebSocketMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect immediately, let idle timeout handle it
      // This allows switching between tabs without disconnecting
    };
  }, []);

  const scrollToBottom = useCallback((animated: boolean = true) => {
    flatListRef.current?.scrollToEnd({ animated });
    setShowScrollToBottom(false);
  }, []);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentSize.height - contentOffset.y - layoutMeasurement.height < 50;
    
    isUserScrolling.current = !isAtBottom;
    setShowScrollToBottom(!isAtBottom && messages.length > 0);
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !senderId) return;

    setSending(true);

    try {
      const messageData = {
        type: 'send_message',
        sender_id: senderId,
        content: messageText.trim(),
        reply_to_id: replyTo?.id,
      };

      // Send via WebSocket if connected, otherwise use REST API
      if (webSocketService.isConnected) {
        webSocketService.sendMessage(messageData);
      } else {
        // Fallback to REST API
        const newMessage = await ApiService.sendAnonymousMessage({
          sender_id: senderId,
          content: messageText.trim(),
          reply_to_id: replyTo?.id,
        });
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      // Clear input and reply
      setMessageText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [messageText, senderId, replyTo]);

  const handleReply = useCallback((message: AnonymousMessage) => {
    setReplyTo(message);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: AnonymousMessage }) => {
    const isOwnMessage = item.sender_id === senderId;

    return (
      <View style={[styles.messageWrapper, isOwnMessage && styles.ownMessageWrapper]}>
        <TouchableOpacity
          onLongPress={() => handleReply(item)}
          activeOpacity={0.7}
        >
          <Card
            style={[
              styles.messageCard,
              isOwnMessage ? styles.ownMessageCard : styles.otherMessageCard,
            ]}
          >
            <Card.Content style={styles.messageContent}>
              {item.reply_content && (
                <Surface style={styles.replyPreview}>
                  <Text variant="bodySmall" style={styles.replyText} numberOfLines={2}>
                    {item.reply_content}
                  </Text>
                </Surface>
              )}
              <Text variant="bodyMedium" style={styles.messageText}>
                {item.content}
              </Text>
              <Text variant="bodySmall" style={styles.messageTime}>
                {formatTime(item.created_at)}
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      {/* Header with connection status */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="titleMedium" style={styles.headerTitle}>
            Anonymous Chat
          </Text>
          <Chip
            icon={connected ? 'lan-connect' : 'lan-disconnect'}
            compact
            style={styles.connectionChip}
          >
            {connectionCount} online
          </Chip>
        </View>
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          if (!isUserScrolling.current) {
            scrollToBottom(false);
          }
        }}
      />

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <TouchableOpacity
          style={styles.scrollToBottomButton}
          onPress={() => scrollToBottom(true)}
        >
          <IconButton icon="chevron-down" size={24} />
        </TouchableOpacity>
      )}

      {/* Reply preview */}
      {replyTo && (
        <Surface style={styles.replyBar}>
          <View style={styles.replyBarContent}>
            <View style={styles.replyBarText}>
              <Text variant="labelSmall" style={styles.replyLabel}>
                Replying to
              </Text>
              <Text variant="bodySmall" numberOfLines={1}>
                {replyTo.content}
              </Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setReplyTo(null)}
            />
          </View>
        </Surface>
      )}

      {/* Message input */}
      <Surface style={styles.inputContainer}>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          mode="outlined"
          multiline
          maxLength={500}
          style={styles.input}
          disabled={sending}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
          loading={sending}
        />
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  connectionChip: {
    height: 28,
  },
  messagesList: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageWrapper: {
    alignSelf: 'flex-end',
  },
  messageCard: {
    elevation: 1,
  },
  ownMessageCard: {
    backgroundColor: '#DCF8C6',
  },
  otherMessageCard: {
    backgroundColor: '#FFFFFF',
  },
  messageContent: {
    padding: 8,
  },
  replyPreview: {
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  replyText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  messageText: {
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'right',
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  replyBar: {
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 8,
    elevation: 2,
  },
  replyBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyBarText: {
    flex: 1,
  },
  replyLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    paddingBottom: 16,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
});
