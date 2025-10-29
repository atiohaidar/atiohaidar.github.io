import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Dialog,
  Button,
  TextInput,
  Text,
  SegmentedButtons,
  Menu,
  Divider,
} from 'react-native-paper';
import { TicketCreate, TicketCategory, TicketPriority } from '@/types/api';

interface CreateTicketDialogProps {
  visible: boolean;
  categories: TicketCategory[];
  onDismiss: () => void;
  onCreate: (ticket: TicketCreate) => Promise<void>;
  loading: boolean;
}

const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  visible,
  categories,
  onDismiss,
  onCreate,
  loading,
}) => {
  const [formData, setFormData] = useState<TicketCreate>({
    title: '',
    description: '',
    category_id: categories[0]?.id || 1,
    priority: 'medium',
    submitter_name: '',
    submitter_email: '',
  });
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && formData.category_id === 1) {
      setFormData((prev) => ({ ...prev, category_id: categories[0].id }));
    }
  }, [categories]);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    await onCreate(formData);
    setFormData({
      title: '',
      description: '',
      category_id: categories[0]?.id || 1,
      priority: 'medium',
      submitter_name: '',
      submitter_email: '',
    });
  };

  const selectedCategory = categories.find((c) => c.id === formData.category_id);

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
      <Dialog.Title>Create New Ticket</Dialog.Title>
      <Dialog.ScrollArea style={styles.scrollArea}>
        <ScrollView>
          <View style={styles.content}>
            <TextInput
              label="Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
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
                  contentStyle={styles.menuButton}
                >
                  Category: {selectedCategory?.name || 'Select'}
                </Button>
              }
            >
              {categories.map((category) => (
                <Menu.Item
                  key={category.id}
                  onPress={() => {
                    setFormData({ ...formData, category_id: category.id });
                    setCategoryMenuVisible(false);
                  }}
                  title={category.name}
                />
              ))}
            </Menu>

            <Text variant="labelLarge" style={styles.label}>
              Priority
            </Text>
            <SegmentedButtons
              value={formData.priority || 'medium'}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value as TicketPriority })
              }
              buttons={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              style={styles.input}
            />

            <Divider style={styles.divider} />

            <Text variant="labelMedium" style={styles.subheading}>
              Contact Information (Optional)
            </Text>

            <TextInput
              label="Your Name"
              value={formData.submitter_name}
              onChangeText={(text) => setFormData({ ...formData, submitter_name: text })}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Your Email"
              value={formData.submitter_email}
              onChangeText={(text) => setFormData({ ...formData, submitter_email: text })}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={onDismiss} disabled={loading}>
          Cancel
        </Button>
        <Button
          onPress={handleSubmit}
          mode="contained"
          loading={loading}
          disabled={loading || !formData.title.trim() || !formData.description.trim()}
        >
          Create
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default CreateTicketDialog;

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '90%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  content: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  menuButton: {
    justifyContent: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  subheading: {
    marginBottom: 12,
    opacity: 0.7,
  },
});
