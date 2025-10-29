import React, { useMemo } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Dialog, TextInput, Button, List, ActivityIndicator, Text } from 'react-native-paper';
import { User } from '@/types/api';

interface CreateDirectMessageDialogProps {
  visible: boolean;
  loading: boolean;
  users: User[];
  query: string;
  currentUsername?: string;
  onQueryChange: (value: string) => void;
  onSelect: (user: User) => void;
  onDismiss: () => void;
  onRetry?: () => void;
}

const CreateDirectMessageDialog: React.FC<CreateDirectMessageDialogProps> = ({
  visible,
  loading,
  users,
  query,
  currentUsername,
  onQueryChange,
  onSelect,
  onDismiss,
  onRetry,
}) => {
  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = currentUsername ? users.filter((user) => user.username !== currentUsername) : users;
    if (!normalized) {
      return list;
    }

    return list.filter((user) => {
      const target = `${user.username} ${user.name ?? ''}`.toLowerCase();
      return target.includes(normalized);
    });
  }, [users, query, currentUsername]);

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title>Start Direct Message</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label="Search username"
          value={query}
          onChangeText={onQueryChange}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator animating size="small" />
              <Text style={styles.loaderText}>Loading users…</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>
                {query ? 'Try a different search keyword.' : 'Invite teammates to join the workspace.'}
              </Text>
              {onRetry && (
                <Button mode="text" onPress={onRetry} style={styles.retryButton}>
                  Refresh users
                </Button>
              )}
            </View>
          ) : (
            <ScrollView>
              <List.Section>
                {filteredUsers.map((user) => (
                  <List.Item
                    key={user.username}
                    title={user.name || user.username}
                    description={`@${user.username}`}
                    onPress={() => onSelect(user)}
                    left={(props) => <List.Icon {...props} icon="account" />}
                  />
                ))}
              </List.Section>
            </ScrollView>
          )}
        </View>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  input: {
    marginBottom: 12,
  },
  listContainer: {
    maxHeight: 320,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loaderText: {
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 8,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 8,
  },
});

export default CreateDirectMessageDialog;
