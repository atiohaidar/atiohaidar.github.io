import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Message, AnonymousMessage } from '@/types/api';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInputBar } from './components/MessageInputBar';
import { webSocketService } from '@/services/websocketService';

type ChatDetailParams = {
  type?: string | string[];
  id?: string | string[];
  name?: string | string[];
};

type ChatType = 'conversation' | 'group' | 'anonymous';

const isChatType = (value: string | undefined): value is ChatType =>
  value === 'conversation' || value === 'group' || value === 'anonymous';

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<ChatDetailParams>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const typeParam = getParamValue(params.type);
  const id = getParamValue(params.id);
  const nameParam = getParamValue(params.name);

  const chatType: ChatType | null = isChatType(typeParam) ? typeParam : null;
  const displayName = nameParam ?? id ?? 'Chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [senderId, setSenderId] = useState<string>('');

  const messagesRef = useRef<ScrollView | null>(null);

  const SENDER_ID_KEY = '@anonymous_sender_id';

  const chatSubtitle = useMemo(
    () => {
      if (chatType === 'anonymous') return 'Public anonymous chat';
      if (chatType === 'group') return 'Group chat';
      return 'Direct message';
    },
    [chatType],
  );

  const avatarLabel = useMemo(() => displayName.substring(0, 2).toUpperCase(), [displayName]);

  const safeBottomInset = useMemo(
    () => Math.max(insets.bottom + insets.top, Platform.OS === 'android' ? 32 : 16),
    [insets.bottom],
  );

  const loadMessages = useCallback(async () => {
    if (!chatType || !id) {
      return;
    }

    setMessagesLoading(true);
    try {
      let data;
      if (chatType === 'conversation') {
        data = await ApiService.getConversationMessages(id);
      } else if (chatType === 'anonymous') {
        data = await ApiService.listAnonymousMessages();
      } else {
        data = await ApiService.getGroupMessages(id);
      }
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [chatType, id]);

  // Initialize sender ID for anonymous chat
  useEffect(() => {
    if (chatType === 'anonymous') {
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
    }
  }, [chatType]);

  useEffect(() => {
    if (!chatType || !id) {
      return;
    }

    loadMessages();
  }, [chatType, id, loadMessages]);

  // Setup WebSocket for anonymous chat
  useEffect(() => {
    if (chatType !== 'anonymous') {
      return;
    }

    webSocketService.ensureConnected();

    const handleWebSocketMessage = (data: any) => {
      if (data.type === 'new_message') {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((msg) => msg.id === data.message.id);
          if (exists) return prev;

          const newMessages = [...prev, data.message];
          setTimeout(() => {
            messagesRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return newMessages;
        });
      }
    };

    webSocketService.onMessage(handleWebSocketMessage);

    return () => {
      webSocketService.offMessage(handleWebSocketMessage);
    };
  }, [chatType]);

  const handleSendMessage = async () => {
    if (!chatType || !id || !messageText.trim()) {
      return;
    }

    setSending(true);
    try {
      if (chatType === 'anonymous') {
        // Anonymous chat via WebSocket
        if (!senderId) {
          alert('Please wait, initializing...');
          setSending(false);
          return;
        }

        const messageData = {
          type: 'send_message',
          sender_id: senderId,
          content: messageText.trim(),
        };

        // Send via WebSocket if connected, otherwise use REST API
        if (webSocketService.isConnected) {
          webSocketService.sendMessage(messageData);
        } else {
          // Fallback to REST API
          const newMessage = await ApiService.sendAnonymousMessage({
            sender_id: senderId,
            content: messageText.trim(),
          });
          setMessages((prev) => [...prev, newMessage]);
          setTimeout(() => {
            messagesRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        // Regular conversation or group chat
        const payload =
          chatType === 'conversation'
            ? { conversation_id: id, content: messageText }
            : { group_id: id, content: messageText };

        const newMessage = await ApiService.sendMessage(payload);
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => {
          messagesRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
      setMessageText('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReloadMessages = () => {
    if (!messagesLoading) {
      loadMessages();
    }
  };

  const keyboardBehavior: 'height' | 'padding' | undefined = Platform.OS === 'ios'
    ? 'padding'
    : Platform.OS === 'android'
    ? 'height'
    : undefined;

  if (!chatType || !id) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ChatHeader
        name={displayName}
        subtitle={chatSubtitle}
        avatarLabel={avatarLabel}
        onBack={() => router.back()}
        onReload={loadMessages}
        loading={messagesLoading}
      />

      <View
        style={[
          styles.messagesWrapper,
          {
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        <MessageList
          messages={messages}
          loading={messagesLoading}
          onReload={handleReloadMessages}
          currentUsername={user?.username}
          scrollRef={messagesRef}
        />
      </View>

      <MessageInputBar
        value={messageText}
        onChangeText={setMessageText}
        onSend={handleSendMessage}
        disabled={sending || messagesLoading}
        bottomInset={safeBottomInset}
      />
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
  },
  messagesWrapper: {
    flex: 1,
  },
});
