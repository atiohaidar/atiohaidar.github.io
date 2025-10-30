import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Conversation, GroupChat, User } from '@/types/api';
import { ChatListHeader } from './components/ChatListHeader';
import { ConversationList } from './components/ConversationList';
import { GroupList } from './components/GroupList';
import { AnonymousChatView } from './components/AnonymousChatView';
import { CreateGroupDialog } from './components/CreateGroupDialog';
import CreateDirectMessageDialog from './components/CreateDirectMessageDialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChatMode = 'conversations' | 'groups' | 'anonymous';

export default function ChatScreen() {
  const [mode, setMode] = useState<ChatMode>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [directDialogVisible, setDirectDialogVisible] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [mode]);

  const loadData = async () => {
    try {
      if (mode === 'conversations') {
        const data = await ApiService.listConversations();
        setConversations(data);
      } else if (mode === 'groups') {
        const data = await ApiService.listGroups();
        setGroups(data);
      }
      // Anonymous chat doesn't need to load list data
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

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await ApiService.listUsers();
      setAvailableUsers(users);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      alert(error.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const openChat = (type: 'conversation' | 'group', id: string, name: string) => {
    const href = {
      pathname: '/chat/[type]/[id]' as const,
      params: { type, id, name },
    } as const;

    router.push(href as unknown as Href);
  };

  const handleStartConversation = async (targetUser: User) => {
    if (creatingConversation) {
      return;
    }

    setCreatingConversation(true);

    try {
      const conversation = await ApiService.getOrCreateConversation(targetUser.username);

      setConversations((prev) => {
        const exists = prev.find((item) => item.id === conversation.id);
        if (exists) {
          return prev;
        }
        return [conversation, ...prev];
      });

      setDirectDialogVisible(false);
      setUserQuery('');

      openChat('conversation', conversation.id, targetUser.name || targetUser.username);
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      alert(error.message || 'Failed to start conversation');
    } finally {
      setCreatingConversation(false);
    }
  };

  const openDirectDialog = () => {
    setDirectDialogVisible(true);
    if (availableUsers.length === 0 && !usersLoading) {
      loadUsers();
    }
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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
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
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ChatListHeader 
          mode={mode} 
          onModeChange={setMode}
          options={[
            { value: 'conversations' as const, label: 'Direct', icon: 'account' },
            { value: 'groups' as const, label: 'Groups', icon: 'account-group' },
            { value: 'anonymous' as const, label: 'Anonymous', icon: 'incognito' },
          ]}
        />

        {mode === 'conversations' ? (
          <ConversationList
            conversations={conversations}
            currentUsername={user?.username}
            onSelect={(conv, displayName) => openChat('conversation', conv.id, displayName)}
          />
        ) : mode === 'groups' ? (
          <GroupList
            groups={groups}
            onSelect={(group) => openChat('group', group.id, group.name)}
          />
        ) : (
          <AnonymousChatView />
        )}
      </ScrollView>

      {mode === 'conversations' ? (
        <FAB
          icon="message-plus"
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          onPress={openDirectDialog}
          label={creatingConversation ? 'Starting…' : 'New Chat'}
          disabled={creatingConversation}
        />
      ) : mode === 'groups' ? (
        <FAB
          icon="plus"
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          onPress={() => setDialogVisible(true)}
          label="New Group"
        />
      ) : null}

      <CreateGroupDialog
        visible={dialogVisible}
        name={groupName}
        description={groupDesc}
        loading={formLoading}
        onChangeName={setGroupName}
        onChangeDescription={setGroupDesc}
        onSubmit={handleCreateGroup}
        onDismiss={() => setDialogVisible(false)}
      />

      <CreateDirectMessageDialog
        visible={directDialogVisible}
        loading={usersLoading}
        users={availableUsers}
        query={userQuery}
        currentUsername={user?.username}
        onQueryChange={setUserQuery}
        onSelect={handleStartConversation}
        onDismiss={() => {
          setDirectDialogVisible(false);
          setUserQuery('');
        }}
        onRetry={loadUsers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
