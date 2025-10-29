import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

interface CreateGroupDialogProps {
  visible: boolean;
  name: string;
  description: string;
  loading?: boolean;
  onChangeName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onSubmit: () => void;
  onDismiss: () => void;
}

export function CreateGroupDialog({
  visible,
  name,
  description,
  loading,
  onChangeName,
  onChangeDescription,
  onSubmit,
  onDismiss,
}: CreateGroupDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Create Group</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Group Name *"
            value={name}
            onChangeText={onChangeName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={onChangeDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            disabled={loading}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button onPress={onSubmit} loading={loading} disabled={loading}>
            Create
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
});
