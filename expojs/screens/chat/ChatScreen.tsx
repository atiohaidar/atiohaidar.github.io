import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Card,
  Text,
  FAB,
  useTheme,
  ActivityIndicator,
  Avatar,
  Chip,
  Portal,
  Dialog,
  Button,
  TextInput,
  SegmentedButtons,
  IconButton,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Conversation, GroupChat, Message, User } from '@/types/api';

type ChatMode = 'conversations' | 'groups';

export default function ChatScreen() {
  const [mode, setMode] = useState<ChatMode>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<{
    type: 'conversation' | 'group';
    id: string;
    name: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const { user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const messagesRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [mode]);

  const loadData = async () => {
    try {
      if (mode === 'conversations') {
        const data = await ApiService.listConversations();
        setConversations(data);
      } else {
        const data = await ApiService.listGroups();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const loadMessages = async (type: 'conversation' | 'group', id: string) => {
    setMessagesLoading(true);
    try {
      const data =
        type === 'conversation'
          ? await ApiService.getConversationMessages(id)
          : await ApiService.getGroupMessages(id);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const openChat = (type: 'conversation' | 'group', id: string, name: string) => {
    setSelectedChat({ type, id, name });
    setMessages([]);
    setMessageText('');
    loadMessages(type, id);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      const messageData =
        selectedChat.type === 'conversation'
          ? { conversation_id: selectedChat.id, content: messageText }
          : { group_id: selectedChat.id, content: messageText };

      const newMessage = await ApiService.sendMessage(messageData);
      setMessages([...messages, newMessage]);
      setMessageText('');
      setTimeout(() => {
        messagesRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message');
    }
  };

  const handleReloadMessages = () => {
    if (selectedChat) {
      loadMessages(selectedChat.type, selectedChat.id);
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setMessages([]);
    setMessageText('');
    setMessagesLoading(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setFormLoading(true);

    try {
      const created = await ApiService.createGroup({
        name: groupName.trim(),
        description: groupDesc.trim() || undefined,
      });

      setGroups((prev) => [created, ...prev]);
      setDialogVisible(false);
      setGroupName('');
      setGroupDesc('');
    } catch (error: any) {
      console.error('Failed to create group:', error);
      alert(error.message || 'Failed to create group');
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setTimeout(() => {
        messagesRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [selectedChat, messages]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const getOtherUsername = (conv: Conversation) => {
    return conv.user1_username === user?.username
      ? conv.user2_username
      : conv.user1_username;
  };

  const renderMessageBubble = (msg: Message) => (
    <View
      key={msg.id}
      style={[
        styles.messageItem,
        msg.sender_username === user?.username ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text variant="labelSmall" style={styles.messageSender}>
        {msg.sender_username}
      </Text>
      <Text variant="bodyMedium" style={styles.messageText}>
        {msg.content}
      </Text>
      <Text variant="labelSmall" style={styles.messageTime}>
        {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
      </Text>
    </View>
  );

  if (selectedChat) {
    const chatSubtitle = selectedChat.type === 'group' ? 'Group chat' : 'Direct message';
    const avatarLabel = selectedChat.name.substring(0, 2).toUpperCase();

    return (
      <KeyboardAvoidingView
        style={[styles.chatContainer, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.chatHeader, { borderBottomColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}> 
          <IconButton icon="arrow-left" onPress={handleBackToList} accessibilityLabel="Back to chats" />
          <View style={styles.chatHeaderInfo}>
            <Avatar.Text size={40} label={avatarLabel} />
            <View style={styles.chatHeaderText}>
              <Text variant="titleMedium" style={styles.chatName}>
                {selectedChat.name}
              </Text>
              <Text variant="bodySmall" style={[styles.chatSubtitle, { color: theme.colors.onSurfaceVariant }] }>
                {chatSubtitle}
              </Text>
            </View>
          </View>
          <IconButton
            icon="refresh"
            onPress={handleReloadMessages}
            disabled={messagesLoading}
            accessibilityLabel="Reload messages"
          />
        </View>

        <View style={[styles.chatContainerContent, { backgroundColor: theme.colors.surfaceVariant }] }>
          {messagesLoading ? (
            <View style={styles.messagesLoading}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Refreshing messages…</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.chatPlaceholder}>
              <Text style={styles.placeholderText}>No messages yet. Say hello!</Text>
            </View>
          ) : (
            <ScrollView
              ref={messagesRef}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              refreshControl={<RefreshControl refreshing={messagesLoading} onRefresh={handleReloadMessages} />}
            >
              {messages.map((msg) => renderMessageBubble(msg))}
            </ScrollView>
          )}
        </View>

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12), borderTopColor: theme.colors.outline }]}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message"
            mode="outlined"
            style={styles.messageInput}
            disabled={messagesLoading}
            right={<TextInput.Icon icon="send" onPress={handleSendMessage} disabled={messagesLoading} />}
            onSubmitEditing={handleSendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Chat
        </Text>

        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as ChatMode)}
          buttons={[
            {
              value: 'conversations',
              label: 'Direct Messages',
              icon: 'account',
            },
            {
              value: 'groups',
              label: 'Groups',
              icon: 'account-group',
            },
          ]}
          style={styles.segmentedButtons}
        />

        {mode === 'conversations' ? (
          <>
            {conversations.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    No conversations yet.
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              conversations.map((conv) => (
                <Card
                  key={conv.id}
                  style={styles.chatCard}
                  mode="elevated"
                  onPress={() =>
                    openChat('conversation', conv.id, getOtherUsername(conv))
                  }
                >
                  <Card.Content>
                    <View style={styles.chatItem}>
                      <Avatar.Text
                        size={48}
                        label={getOtherUsername(conv).substring(0, 2).toUpperCase()}
                      />
                      <View style={styles.chatInfo}>
                        <Text variant="titleMedium">{getOtherUsername(conv)}</Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {conv.updated_at
                            ? new Date(conv.updated_at).toLocaleDateString()
                            : 'No messages'}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </>
        ) : (
          <>
            {groups.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    No groups yet. Create your first group!
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              groups.map((group) => (
                <Card
                  key={group.id}
                  style={styles.chatCard}
                  mode="elevated"
                  onPress={() => openChat('group', group.id, group.name)}
                >
                  <Card.Content>
                    <View style={styles.chatItem}>
                      <Avatar.Text
                        size={48}
                        label={group.name.substring(0, 2).toUpperCase()}
                      />
                      <View style={styles.chatInfo}>
                        <Text variant="titleMedium">{group.name}</Text>
                        {group.description && (
                          <Text
                            variant="bodySmall"
                            style={{ color: theme.colors.onSurfaceVariant }}
                            numberOfLines={1}
                          >
                            {group.description}
                          </Text>
                        )}
                        <Chip icon="account" compact style={styles.chip}>
                          Created by {group.created_by}
                        </Chip>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>

      {mode === 'groups' && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setDialogVisible(true)}
          label="New Group"
        />
      )}

      {/* Create Group Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Create Group</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Group Name *"
              value={groupName}
              onChangeText={setGroupName}
              mode="outlined"
              style={styles.input}
              disabled={formLoading}
            />
            <TextInput
              label="Description"
              value={groupDesc}
              onChangeText={setGroupDesc}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={formLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onPress={handleCreateGroup} loading={formLoading} disabled={formLoading}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  chatCard: {
    marginBottom: 12,
    elevation: 2,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInfo: {
    marginLeft: 12,
    flex: 1,
  },
  chip: {
    height: 24,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 4,
  },
  chatHeaderText: {
    marginLeft: 8,
  },
  chatName: {
    fontWeight: '600',
  },
  chatSubtitle: {
    color: '#6c6c6c',
  },
  chatContainerContent: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  messagesContent: {
    paddingVertical: 12,
    gap: 8,
  },
  messagesLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#6c6c6c',
  },
  chatPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    color: '#6c6c6c',
  },
  messageItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1266f1',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2f3640',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#4b4e57',
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#ffffff',
  },
  messageText: {
    lineHeight: 20,
    color: '#ffffff',
  },
  messageTime: {
    marginTop: 4,
    opacity: 0.85,
    fontSize: 11,
    color: '#f0f0f0',
  },
  messageInput: {
    flex: 1,
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#ffffff',
  },
});
