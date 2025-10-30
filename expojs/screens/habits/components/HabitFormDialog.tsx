import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Dialog, Portal, Button, TextInput, Text, SegmentedButtons } from 'react-native-paper';
import { useCreateHabit } from '@/hooks/useApi';
import { HabitPeriodType } from '@/types/api';

interface HabitFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function HabitFormDialog({ visible, onDismiss }: HabitFormDialogProps) {
  const createHabitMutation = useCreateHabit();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [periodType, setPeriodType] = useState<HabitPeriodType>('daily');
  const [periodDays, setPeriodDays] = useState('1');

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    try {
      await createHabitMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        period_type: periodType,
        period_days: periodType === 'custom' ? parseInt(periodDays) || 1 : undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setPeriodType('daily');
    setPeriodDays('1');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title>Create New Habit</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={styles.content}>
            <TextInput
              label="Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Text variant="labelMedium" style={styles.label}>
              Period Type
            </Text>
            <SegmentedButtons
              value={periodType}
              onValueChange={(value) => setPeriodType(value as HabitPeriodType)}
              buttons={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'custom', label: 'Custom' },
              ]}
              style={styles.segmented}
            />

            {periodType === 'custom' && (
              <TextInput
                label="Days per Period"
                value={periodDays}
                onChangeText={setPeriodDays}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
              />
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button
            onPress={handleSubmit}
            loading={createHabitMutation.isPending}
            disabled={!name.trim() || createHabitMutation.isPending}>
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 16,
  },
});
