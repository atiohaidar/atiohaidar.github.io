import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  useTheme,
  Portal,
  Dialog,
  Button,
  TextInput,
} from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Discussion, DiscussionCreate } from '@/types/api';
import { useRouter } from 'expo-router';

export default function DiscussionsScreen() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<DiscussionCreate>({
    title: '',
    content: '',
    creator_name: '',
  });
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const discussionsData = await ApiService.listDiscussions();
      setDiscussions(discussionsData);
    } catch (error) {
      console.error('Failed to load discussions:', error);
      Alert.alert('Error', 'Failed to load discussions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateDiscussion = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }

    setFormLoading(true);
    try {
      const newDiscussion = await ApiService.createDiscussion(formData);
      setDiscussions([newDiscussion, ...discussions]);
      setDialogVisible(false);
      setFormData({
        title: '',
        content: '',
        creator_name: '',
      });
      Alert.alert('Success', 'Discussion created successfully');
    } catch (error: any) {
      console.error('Failed to create discussion:', error);
      Alert.alert('Error', error.message || 'Failed to create discussion');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    Alert.alert('Delete Discussion', 'Are you sure you want to delete this discussion?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteDiscussion(discussionId);
            setDiscussions(discussions.filter((d) => d.id !== discussionId));
            Alert.alert('Success', 'Discussion deleted successfully');
          } catch (error: any) {
            console.error('Failed to delete discussion:', error);
            Alert.alert('Error', error.message || 'Failed to delete discussion');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading discussions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {discussions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No discussions yet</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Start a discussion to engage with the community
            </Text>
          </View>
        ) : (
          discussions.map((discussion) => (
            <GlassCard
              key={discussion.id}
              style={styles.card}
              mode="elevated"
              onPress={() => router.push(`/discussions/${discussion.id}`)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {discussion.title}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.onSurfaceVariant }}
                      numberOfLines={2}
                    >
                      {discussion.content}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Chip icon="account" compact style={styles.chip}>
                        {discussion.creator_name}
                      </Chip>
                      <Chip icon="comment-multiple" compact style={styles.chip}>
                        {discussion.reply_count} replies
                      </Chip>
                      <Chip icon="clock-outline" compact style={styles.chip}>
                        {new Date(discussion.created_at || '').toLocaleDateString()}
                      </Chip>
                    </View>
                  </View>
                  {(discussion.creator_username === user?.username || user?.role === 'admin') && (
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => handleDeleteDiscussion(discussion.id)}
                    />
                  )}
                </View>
              </Card.Content>
            </GlassCard>
          ))
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Start a Discussion</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              <View style={styles.dialogContent}>
                <TextInput
                  label="Title *"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Content *"
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                  mode="outlined"
                  multiline
                  numberOfLines={6}
                  style={styles.input}
                />
                {!user && (
                  <TextInput
                    label="Your Name (Optional)"
                    value={formData.creator_name}
                    onChangeText={(text) => setFormData({ ...formData, creator_name: text })}
                    mode="outlined"
                    style={styles.input}
                    placeholder="Leave blank to post anonymously"
                  />
                )}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onPress={handleCreateDiscussion}
              mode="contained"
              loading={formLoading}
              disabled={formLoading || !formData.title.trim() || !formData.content.trim()}
            >
              Post
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
        label="New Discussion"
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
  loadingText: {
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptySubtext: {
    marginTop: 8,
    opacity: 0.6,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  dialog: {
    maxHeight: '90%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  dialogContent: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
