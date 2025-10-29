import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Message } from '@/types/api';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInputBar } from './components/MessageInputBar';

type ChatDetailParams = {
  type?: string | string[];
  id?: string | string[];
  name?: string | string[];
};

type ChatType = 'conversation' | 'group';

const isChatType = (value: string | undefined): value is ChatType =>
  value === 'conversation' || value === 'group';

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

  const messagesRef = useRef<ScrollView | null>(null);

  const chatSubtitle = useMemo(
    () => (chatType === 'group' ? 'Group chat' : 'Direct message'),
    [chatType],
  );

  const avatarLabel = useMemo(() => displayName.substring(0, 2).toUpperCase(), [displayName]);

  const loadMessages = useCallback(async () => {
    if (!chatType || !id) {
      return;
    }

    setMessagesLoading(true);
    try {
      const data =
        chatType === 'conversation'
          ? await ApiService.getConversationMessages(id)
          : await ApiService.getGroupMessages(id);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [chatType, id]);

  useEffect(() => {
    if (!chatType || !id) {
      return;
    }

    loadMessages();
  }, [chatType, id, loadMessages]);

  const handleSendMessage = async () => {
    if (!chatType || !id || !messageText.trim()) {
      return;
    }

    setSending(true);
    try {
      const payload =
        chatType === 'conversation'
          ? { conversation_id: id, content: messageText }
          : { group_id: id, content: messageText };

      const newMessage = await ApiService.sendMessage(payload);
      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');
      setTimeout(() => {
        messagesRef.current?.scrollToEnd({ animated: true });
      }, 120);
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ChatHeader
        name={displayName}
        subtitle={chatSubtitle}
        avatarLabel={avatarLabel}
        onBack={() => router.back()}
        onReload={loadMessages}
        loading={messagesLoading}
      />

      <View style={[styles.messagesWrapper, { backgroundColor: theme.colors.surfaceVariant }]}
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
        bottomInset={insets.bottom}
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
