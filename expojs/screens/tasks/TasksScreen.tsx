import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask } from '@/hooks/useApi';
import { Task, TaskCreate, TaskUpdate } from '@/types/api';
import TaskList from './components/TaskList';
import TaskFormDialog, { TaskFormState } from './components/TaskFormDialog';

export default function TasksScreen() {
  const { data: tasks = [], isLoading, refetch, isRefetching } = useTasks();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const createTaskMutation = useCreateTask();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormState>({
    name: '',
    description: '',
    completed: false,
    due_date: '',
  });

  const { user, isAdmin } = useAuth();

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        updates: { completed: !task.completed },
      });
    } catch (error: any) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', error.message || 'Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskMutation.mutateAsync(task.id);
            } catch (error: any) {
              console.error('Failed to delete task:', error);
              Alert.alert('Error', error.message || 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setFormData({
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
      name: task.name,
      description: task.description || '',
      completed: task.completed,
      due_date: task.due_date || '',
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        const updates: TaskUpdate = {
          name: formData.name,
          description: formData.description || undefined,
          completed: formData.completed,
          due_date: formData.due_date || undefined,
        };
        await updateTaskMutation.mutateAsync({
          id: editingTask.id,
          updates,
        });
      } else {
        // Create new task
        const newTask: TaskCreate = {
          name: formData.name,
          description: formData.description || undefined,
          completed: formData.completed,
          due_date: formData.due_date || undefined,
        };
        await createTaskMutation.mutateAsync(newTask);
      }
      setDialogVisible(false);
    } catch (error: any) {
      console.error('Failed to save task:', error);
      Alert.alert('Error', error.message || 'Failed to save task');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const canEdit = (task: Task) => isAdmin || task.owner === user?.username;

  const isFormLoading =
    updateTaskMutation.isPending || createTaskMutation.isPending || deleteTaskMutation.isPending;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>
          My Tasks
        </Text>

        <TaskList
          tasks={tasks}
          canEdit={canEdit}
          onToggleComplete={handleToggleComplete}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreateDialog}
        label="New Task"
      />

      <TaskFormDialog
        visible={dialogVisible}
        editingTask={editingTask}
        formData={formData}
        isSubmitting={isFormLoading}
        onChange={(changes) => setFormData({ ...formData, ...changes })}
        onDismiss={() => setDialogVisible(false)}
        onSubmit={handleSubmit}
      />
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
