import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Dialog, Button, TextInput, Text } from 'react-native-paper';

import { Room } from '@/types/api';

interface FormData {
  room_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

interface CreateBookingDialogProps {
  visible: boolean;
  rooms: Room[];
  formData: FormData;
  loading: boolean;
  onDismiss: () => void;
  onChange: (data: Partial<FormData>) => void;
  onSubmit: () => void;
}

const CreateBookingDialog: React.FC<CreateBookingDialogProps> = ({
  visible,
  rooms,
  formData,
  loading,
  onDismiss,
  onChange,
  onSubmit,
}) => {
  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title>Create Booking</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView>
          <Text variant="labelLarge" style={styles.label}>
            Select Room
          </Text>
          {rooms.map((room) => (
            <Button
              key={room.id}
              mode={formData.room_id === room.id ? 'contained' : 'outlined'}
              onPress={() => onChange({ room_id: room.id })}
              style={styles.roomButton}
              disabled={loading}
            >
              {room.name} (Capacity: {room.capacity})
            </Button>
          ))}
          <TextInput
            label="Title *"
            value={formData.title}
            onChangeText={(text) => onChange({ title: text })}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => onChange({ description: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            disabled={loading}
          />
          <TextInput
            label="Start Time * (YYYY-MM-DDTHH:MM:SSZ)"
            value={formData.start_time}
            onChangeText={(text) => onChange({ start_time: text })}
            mode="outlined"
            style={styles.input}
            placeholder="2024-12-31T09:00:00Z"
            disabled={loading}
          />
          <TextInput
            label="End Time * (YYYY-MM-DDTHH:MM:SSZ)"
            value={formData.end_time}
            onChangeText={(text) => onChange({ end_time: text })}
            mode="outlined"
            style={styles.input}
            placeholder="2024-12-31T11:00:00Z"
            disabled={loading}
          />
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={onDismiss} disabled={loading}>
          Cancel
        </Button>
        <Button onPress={onSubmit} loading={loading} disabled={loading}>
          Create
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default CreateBookingDialog;

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  roomButton: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
});
