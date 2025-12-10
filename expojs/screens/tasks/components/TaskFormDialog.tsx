import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, TextInput, Checkbox, Text, Button } from 'react-native-paper';
import type { Task } from '@/types/api';
import { DatePickerInput } from '@/components/DatePickerInput';

export interface TaskFormState {
  name: string;
  description: string;
  completed: boolean;
  due_date: string;
}

interface TaskFormDialogProps {
  visible: boolean;
  editingTask: Task | null;
  formData: TaskFormState;
  isSubmitting: boolean;
  onChange: (changes: Partial<TaskFormState>) => void;
  onDismiss: () => void;
  onSubmit: () => void;
}

export function TaskFormDialog({
  visible,
  editingTask,
  formData,
  isSubmitting,
  onChange,
  onDismiss,
  onSubmit,
}: TaskFormDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{editingTask ? 'Edit Task' : 'Create Task'}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Task Name"
            value={formData.name}
            onChangeText={(text) => onChange({ name: text })}
            mode="outlined"
            style={styles.input}
            disabled={isSubmitting}
          />
          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => onChange({ description: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            disabled={isSubmitting}
          />
          <DatePickerInput
            label="Due Date"
            value={formData.due_date}
            onChange={(date) => onChange({ due_date: date })}
            mode="date"
            disabled={isSubmitting}
            style={styles.input}
          />
          <View style={styles.checkboxRow}>
            <Checkbox
              status={formData.completed ? 'checked' : 'unchecked'}
              onPress={() => onChange({ completed: !formData.completed })}
              disabled={isSubmitting}
            />
            <Text variant="bodyLarge">Mark as completed</Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onPress={onSubmit} loading={isSubmitting} disabled={isSubmitting}>
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default TaskFormDialog;
