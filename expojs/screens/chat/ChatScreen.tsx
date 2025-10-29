import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  FAB,
  List,
  useTheme,
  ActivityIndicator,
  Avatar,
  Chip,
  Portal,
  Dialog,
  Button,
  TextInput,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
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
  const [chatDialogVisible, setChatDialogVisible] = useState(false);
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

  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
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
    try {
      const data =
        type === 'conversation'
          ? await ApiService.getConversationMessages(id)
          : await ApiService.getGroupMessages(id);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const openChat = (type: 'conversation' | 'group', id: string, name: string) => {
    setSelectedChat({ type, id, name });
    loadMessages(type, id);
    setChatDialogVisible(true);
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
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setFormLoading(true);
    try {
      const newGroup = await ApiService.createGroup({
        name: groupName,
        description: groupDesc || undefined,
      });
      setGroups([newGroup, ...groups]);
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

      {/* Chat Dialog */}
      <Portal>
        <Dialog
          visible={chatDialogVisible}
          onDismiss={() => setChatDialogVisible(false)}
          style={styles.chatDialog}
        >
          <Dialog.Title>{selectedChat?.name}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
              ) : (
                messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageItem,
                      msg.sender_username === user?.username
                        ? styles.myMessage
                        : styles.otherMessage,
                    ]}
                  >
                    <Text variant="labelSmall" style={styles.messageSender}>
                      {msg.sender_username}
                    </Text>
                    <Text variant="bodyMedium">{msg.content}</Text>
                    <Text variant="labelSmall" style={styles.messageTime}>
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleString()
                        : ''}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Divider />
          <View style={styles.inputContainer}>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              mode="outlined"
              style={styles.messageInput}
              right={
                <TextInput.Icon icon="send" onPress={handleSendMessage} />
              }
              onSubmitEditing={handleSendMessage}
            />
          </View>
        </Dialog>
      </Portal>
    </View>
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
  chatDialog: {
    maxHeight: '80%',
  },
  messagesContainer: {
    maxHeight: 400,
    padding: 8,
  },
  messageItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6200ee',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageTime: {
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
  },
});
