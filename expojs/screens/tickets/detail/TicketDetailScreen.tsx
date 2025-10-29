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
  Switch,
  Menu,
  SegmentedButtons,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import {
  Ticket,
  TicketComment,
  TicketAssignment,
  User,
  TicketCategory,
  TicketStatus,
  TicketPriority,
} from '@/types/api';

const statusColors: Record<TicketStatus, string> = {
  open: '#FF9800',
  in_progress: '#2196F3',
  waiting: '#9C27B0',
  solved: '#4CAF50',
};

const priorityColors: Record<TicketPriority, string> = {
  low: '#8BC34A',
  medium: '#FF9800',
  high: '#FF5722',
  critical: '#F44336',
};

export default function TicketDetailScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const theme = useTheme();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [assignments, setAssignments] = useState<TicketAssignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Comment form
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Assignment form
  const [assignMenuVisible, setAssignMenuVisible] = useState(false);
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category_id: 0,
    status: '' as TicketStatus,
    priority: '' as TicketPriority,
  });
  const [updating, setUpdating] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [ticketId]);

  const loadData = async () => {
    if (!ticketId) return;

    try {
      const [ticketData, commentsData, assignmentsData, usersData, categoriesData] =
        await Promise.all([
          ApiService.getTicket(Number(ticketId)),
          ApiService.listTicketComments(Number(ticketId), isAdmin),
          ApiService.listTicketAssignments(Number(ticketId)),
          isAdmin ? ApiService.listUsers() : Promise.resolve([]),
          ApiService.listTicketCategories(),
        ]);

      setTicket(ticketData);
      setComments(commentsData);
      setAssignments(assignmentsData);
      setUsers(usersData);
      setCategories(categoriesData);
      setEditData({
        title: ticketData.title,
        description: ticketData.description,
        category_id: ticketData.category_id,
        status: ticketData.status,
        priority: ticketData.priority,
      });
    } catch (error: any) {
      console.error('Failed to load ticket:', error);
      Alert.alert('Error', error.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await ApiService.createTicketComment(ticket.id, {
        comment_text: newComment.trim(),
        is_internal: isInternal,
      });
      setComments([...comments, comment]);
      setNewComment('');
      setIsInternal(false);
      Alert.alert('Success', 'Comment added successfully');
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssign = async (username: string) => {
    if (!ticket) return;

    setAssigning(true);
    try {
      const assignment = await ApiService.assignTicket(ticket.id, {
        assigned_to: username,
        notes: assignNotes.trim() || undefined,
      });
      setAssignments([...assignments, assignment]);
      setAssignNotes('');
      setAssignMenuVisible(false);
      setTicket({ ...ticket, assigned_to: username });
      Alert.alert('Success', 'Ticket assigned successfully');
    } catch (error: any) {
      console.error('Failed to assign ticket:', error);
      Alert.alert('Error', error.message || 'Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdate = async () => {
    if (!ticket) return;

    setUpdating(true);
    try {
      const updated = await ApiService.updateTicket(ticket.id, editData);
      setTicket(updated);
      setEditMode(false);
      Alert.alert('Success', 'Ticket updated successfully');
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      Alert.alert('Error', error.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading ticket...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Ticket not found</Text>
      </View>
    );
  }

  const statusColor = statusColors[ticket.status] ?? theme.colors.primary;
  const priorityColor = priorityColors[ticket.priority] ?? theme.colors.secondary;
  const selectedCategory = categories.find((c) => c.id === editData.category_id);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="headlineSmall" style={styles.ticketId}>
              #{ticket.id}
            </Text>
            {isAdmin && !editMode && (
              <IconButton icon="pencil" size={20} onPress={() => setEditMode(true)} />
            )}
          </View>

          {editMode ? (
            <View>
              <TextInput
                label="Title"
                value={editData.title}
                onChangeText={(text) => setEditData({ ...editData, title: text })}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={editData.description}
                onChangeText={(text) => setEditData({ ...editData, description: text })}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />

              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setCategoryMenuVisible(true)}
                    style={styles.input}
                  >
                    Category: {selectedCategory?.name || 'Select'}
                  </Button>
                }
              >
                {categories.map((category) => (
                  <Menu.Item
                    key={category.id}
                    onPress={() => {
                      setEditData({ ...editData, category_id: category.id });
                      setCategoryMenuVisible(false);
                    }}
                    title={category.name}
                  />
                ))}
              </Menu>

              <Text variant="labelLarge" style={styles.label}>
                Status
              </Text>
              <SegmentedButtons
                value={editData.status}
                onValueChange={(value) =>
                  setEditData({ ...editData, status: value as TicketStatus })
                }
                buttons={[
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'waiting', label: 'Waiting' },
                  { value: 'solved', label: 'Solved' },
                ]}
                style={styles.input}
              />

              <Text variant="labelLarge" style={styles.label}>
                Priority
              </Text>
              <SegmentedButtons
                value={editData.priority}
                onValueChange={(value) =>
                  setEditData({ ...editData, priority: value as TicketPriority })
                }
                buttons={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                style={styles.input}
              />

              <View style={styles.editActions}>
                <Button onPress={() => setEditMode(false)} disabled={updating}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleUpdate} loading={updating}>
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <>
              <Text variant="titleLarge" style={styles.title}>
                {ticket.title}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {ticket.description}
              </Text>

              <View style={styles.meta}>
                <Chip
                  icon="flag"
                  compact
                  style={[styles.chip, { backgroundColor: priorityColor }]}
                  textStyle={{ color: '#fff' }}
                >
                  {ticket.priority.toUpperCase()}
                </Chip>
                <Chip
                  icon="progress-check"
                  compact
                  style={[styles.chip, { backgroundColor: statusColor }]}
                  textStyle={{ color: '#fff' }}
                >
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </Chip>
                {ticket.category_name && (
                  <Chip icon="tag" compact style={styles.chip}>
                    {ticket.category_name}
                  </Chip>
                )}
                {ticket.submitter_name && (
                  <Chip icon="account" compact style={styles.chip}>
                    {ticket.submitter_name}
                  </Chip>
                )}
                {ticket.assigned_to && (
                  <Chip icon="account-check" compact style={styles.chip}>
                    Assigned: {ticket.assigned_to}
                  </Chip>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Assignment Section */}
      {isAdmin && !editMode && (
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Assignment
            </Text>
            <Menu
              visible={assignMenuVisible}
              onDismiss={() => setAssignMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  icon="account-plus"
                  onPress={() => setAssignMenuVisible(true)}
                  style={styles.input}
                >
                  {ticket.assigned_to ? 'Reassign' : 'Assign to user'}
                </Button>
              }
            >
              {users.map((u) => (
                <Menu.Item
                  key={u.username}
                  onPress={() => handleAssign(u.username)}
                  title={`${u.name} (${u.username})`}
                />
              ))}
            </Menu>

            {assignments.length > 0 && (
              <>
                <Divider style={styles.divider} />
                <Text variant="labelLarge" style={styles.label}>
                  Assignment History
                </Text>
                {assignments.map((assignment, index) => (
                  <View key={index} style={styles.assignmentItem}>
                    <Text variant="bodySmall">
                      Assigned to <Text style={{ fontWeight: 'bold' }}>{assignment.assigned_to}</Text> by{' '}
                      {assignment.assigned_by}
                    </Text>
                    {assignment.notes && (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Notes: {assignment.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Comments Section */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Comments ({comments.length})
          </Text>

          {comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text variant="labelLarge">{comment.commenter_name}</Text>
                {comment.is_internal && (
                  <Chip compact style={styles.internalChip}>
                    Internal
                  </Chip>
                )}
              </View>
              <Text variant="bodyMedium" style={styles.commentText}>
                {comment.comment_text}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {new Date(comment.created_at || '').toLocaleString()}
              </Text>
              {index < comments.length - 1 && <Divider style={styles.commentDivider} />}
            </View>
          ))}

          <Divider style={styles.divider} />

          <TextInput
            label="Add Comment"
            value={newComment}
            onChangeText={setNewComment}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          {isAdmin && (
            <View style={styles.switchRow}>
              <Text>Internal Comment (only visible to admins)</Text>
              <Switch value={isInternal} onValueChange={setIsInternal} />
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleAddComment}
            loading={submittingComment}
            disabled={!newComment.trim() || submittingComment}
            style={styles.input}
          >
            Add Comment
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
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  assignmentItem: {
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  commentText: {
    marginBottom: 4,
  },
  commentDivider: {
    marginTop: 12,
  },
  internalChip: {
    height: 24,
    backgroundColor: '#9C27B0',
  },
  divider: {
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
