import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Divider,
  Button,
  TextInput,
  useTheme,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { DiscussionWithReplies, DiscussionReplyCreate } from '@/types/api';

export default function DiscussionDetailScreen() {
  const { discussionId } = useLocalSearchParams<{ discussionId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();

  const [discussion, setDiscussion] = useState<DiscussionWithReplies | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replying, setReplying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (discussionId) {
      loadDiscussion();
    }
  }, [discussionId]);

  const loadDiscussion = async () => {
    if (!discussionId) return;

    try {
      const data = await ApiService.getDiscussion(discussionId);
      setDiscussion(data);
    } catch (error: any) {
      console.error('Failed to load discussion:', error);
      Alert.alert('Error', error.message || 'Failed to load discussion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDiscussion();
  };

  const handleReply = async () => {
    if (!discussionId || !replyContent.trim()) {
      Alert.alert('Error', 'Reply content is required');
      return;
    }

    setReplying(true);
    try {
      const replyData: DiscussionReplyCreate = {
        content: replyContent.trim(),
      };

      // Only send creator_name if not logged in
      if (!user && replyName.trim()) {
        replyData.creator_name = replyName.trim();
      }

      await ApiService.createDiscussionReply(discussionId, replyData);
      setReplyContent('');
      setReplyName('');
      await loadDiscussion();
      Alert.alert('Success', 'Reply posted successfully');
    } catch (error: any) {
      console.error('Failed to post reply:', error);
      Alert.alert('Error', error.message || 'Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!discussionId || !discussion) return;

    Alert.alert(
      'Delete Discussion',
      'Are you sure you want to delete this discussion? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await ApiService.deleteDiscussion(discussionId);
              Alert.alert('Success', 'Discussion deleted successfully');
              router.back();
            } catch (error: any) {
              console.error('Failed to delete discussion:', error);
              Alert.alert('Error', error.message || 'Failed to delete discussion');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading discussion...</Text>
      </View>
    );
  }

  if (!discussion) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Discussion not found</Text>
      </View>
    );
  }

  const canDelete =
    user &&
    (discussion.creator_username === user.username || user.role === 'admin');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Main Discussion Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="headlineSmall" style={styles.title}>
              {discussion.title}
            </Text>
            {canDelete && (
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.error}
                onPress={handleDelete}
                disabled={deleting}
              />
            )}
          </View>

          <Text variant="bodyLarge" style={styles.content}>
            {discussion.content}
          </Text>

          <View style={styles.meta}>
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
        </Card.Content>
      </Card>

      {/* Replies Section */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Replies ({discussion.replies.length})
          </Text>

          {discussion.replies.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No replies yet. Be the first to reply!
            </Text>
          ) : (
            discussion.replies.map((reply, index) => (
              <View key={reply.id || index} style={styles.replyItem}>
                <View style={styles.replyHeader}>
                  <Chip icon="account" compact style={styles.replyChip}>
                    {reply.creator_name}
                  </Chip>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(reply.created_at || '').toLocaleString()}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.replyContent}>
                  {reply.content}
                </Text>
                {index < discussion.replies.length - 1 && <Divider style={styles.replyDivider} />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Reply Form */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Post a Reply
          </Text>

          <TextInput
            label="Your Reply *"
            value={replyContent}
            onChangeText={setReplyContent}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          {!user && (
            <TextInput
              label="Your Name (Optional)"
              value={replyName}
              onChangeText={setReplyName}
              mode="outlined"
              placeholder="Leave blank to post anonymously"
              style={styles.input}
            />
          )}

          <Button
            mode="contained"
            onPress={handleReply}
            loading={replying}
            disabled={!replyContent.trim() || replying}
          >
            Post Reply
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  replyItem: {
    marginBottom: 16,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyChip: {
    height: 24,
  },
  replyContent: {
    marginTop: 4,
  },
  replyDivider: {
    marginTop: 16,
  },
  input: {
    marginBottom: 12,
  },
});
