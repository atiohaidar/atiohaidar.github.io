import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  FAB,
  Checkbox,
  IconButton,
  useTheme,
  ActivityIndicator,
  Chip,
  Portal,
  Dialog,
  Button,
  TextInput,
} from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Task, TaskCreate, TaskUpdate } from '@/types/api';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    completed: false,
    due_date: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const { user, isAdmin } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await ApiService.listTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updated = await ApiService.updateTask(task.slug, {
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t.slug === task.slug ? updated : t)));
    } catch (error: any) {
      console.error('Failed to update task:', error);
      alert(error.message || 'Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await ApiService.deleteTask(task.slug);
      setTasks(tasks.filter((t) => t.slug !== task.slug));
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      alert(error.message || 'Failed to delete task');
    }
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setFormData({
      slug: '',
      name: '',
      description: '',
      completed: false,
      due_date: '',
    });
    setDialogVisible(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      slug: task.slug,
      name: task.name,
      description: task.description || '',
      completed: task.completed,
      due_date: task.due_date || '',
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Please enter a task name');
      return;
    }

    setFormLoading(true);

    try {
      if (editingTask) {
        // Update existing task
        const updates: TaskUpdate = {
          name: formData.name,
          description: formData.description || undefined,
          completed: formData.completed,
          due_date: formData.due_date || undefined,
        };
        const updated = await ApiService.updateTask(editingTask.slug, updates);
        setTasks(tasks.map((t) => (t.slug === editingTask.slug ? updated : t)));
      } else {
        // Create new task
        if (!formData.slug) {
          alert('Please enter a task slug');
          setFormLoading(false);
          return;
        }
        const newTask: TaskCreate = {
          slug: formData.slug,
          name: formData.name,
          description: formData.description || undefined,
          completed: formData.completed,
          due_date: formData.due_date || undefined,
        };
        const created = await ApiService.createTask(newTask);
        setTasks([created, ...tasks]);
      }
      setDialogVisible(false);
    } catch (error: any) {
      console.error('Failed to save task:', error);
      alert(error.message || 'Failed to save task');
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

  const canEdit = (task: Task) => isAdmin || task.owner === user?.username;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="headlineMedium" style={styles.title}>
          My Tasks
        </Text>

        {tasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No tasks yet. Create your first task!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.slug} style={styles.taskCard} mode="elevated">
              <Card.Content>
                <View style={styles.taskHeader}>
                  <View style={styles.taskTitleRow}>
                    <Checkbox
                      status={task.completed ? 'checked' : 'unchecked'}
                      onPress={() => canEdit(task) && handleToggleComplete(task)}
                      disabled={!canEdit(task)}
                    />
                    <View style={styles.taskInfo}>
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.taskName,
                          task.completed && styles.completedTask,
                        ]}
                      >
                        {task.name}
                      </Text>
                      {task.description && (
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.onSurfaceVariant }}
                        >
                          {task.description}
                        </Text>
                      )}
                      <View style={styles.taskMeta}>
                        {task.due_date && (
                          <Chip icon="calendar" compact style={styles.chip}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </Chip>
                        )}
                        {task.owner && (
                          <Chip icon="account" compact style={styles.chip}>
                            {task.owner}
                          </Chip>
                        )}
                      </View>
                    </View>
                  </View>
                  {canEdit(task) && (
                    <View style={styles.taskActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => openEditDialog(task)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDelete(task)}
                      />
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreateDialog}
        label="New Task"
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editingTask ? 'Edit Task' : 'Create Task'}</Dialog.Title>
          <Dialog.Content>
            {!editingTask && (
              <TextInput
                label="Slug (URL-friendly ID)"
                value={formData.slug}
                onChangeText={(text) => setFormData({ ...formData, slug: text })}
                mode="outlined"
                style={styles.input}
                disabled={formLoading}
              />
            )}
            <TextInput
              label="Task Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
              disabled={formLoading}
            />
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={formLoading}
            />
            <TextInput
              label="Due Date (YYYY-MM-DD)"
              value={formData.due_date}
              onChangeText={(text) => setFormData({ ...formData, due_date: text })}
              mode="outlined"
              style={styles.input}
              placeholder="2024-12-31"
              disabled={formLoading}
            />
            <View style={styles.checkboxRow}>
              <Checkbox
                status={formData.completed ? 'checked' : 'unchecked'}
                onPress={() =>
                  setFormData({ ...formData, completed: !formData.completed })
                }
                disabled={formLoading}
              />
              <Text variant="bodyLarge">Mark as completed</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onPress={handleSubmit} loading={formLoading} disabled={formLoading}>
              {editingTask ? 'Update' : 'Create'}
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
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  taskCard: {
    marginBottom: 12,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 8,
  },
  taskName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  taskActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
