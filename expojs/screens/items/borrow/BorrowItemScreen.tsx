import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import { DatePickerInput } from '@/components/DatePickerInput';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Item, ItemBorrowingCreate } from '@/types/api';

export default function BorrowItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ItemBorrowingCreate>({
    item_id: itemId || '',
    quantity: 1,
    start_date: '',
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  const loadItem = async () => {
    if (!itemId) return;

    try {
      const itemData = await ApiService.getItem(itemId);
      setItem(itemData);
      setFormData((prev) => ({ ...prev, item_id: itemId }));
    } catch (error: any) {
      console.error('Failed to load item:', error);
      Alert.alert('Error', error.message || 'Failed to load item');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date) {
      Alert.alert('Error', 'Please select start and end dates');
      return;
    }

    if (formData.quantity < 1 || (item && formData.quantity > item.stock)) {
      Alert.alert('Error', `Quantity must be between 1 and ${item?.stock || 0}`);
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      await ApiService.createItemBorrowing(formData);
      Alert.alert('Success', 'Borrowing request submitted successfully');
      router.back();
    } catch (error: any) {
      console.error('Failed to create borrowing:', error);
      Alert.alert('Error', error.message || 'Failed to create borrowing request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading item...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Item not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <GlassCard style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Borrow Item
          </Text>

          {/* Item Info */}
          <GlassCard style={styles.itemCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" style={styles.itemName}>
                {item.name}
              </Text>
              {item.description && (
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                >
                  {item.description}
                </Text>
              )}
              <View style={styles.itemMeta}>
                <Chip icon="package-variant" compact style={styles.chip}>
                  Available: {item.stock}
                </Chip>
                <Chip icon="account" compact style={styles.chip}>
                  Owner: {item.owner_username}
                </Chip>
              </View>
            </Card.Content>
          </GlassCard>

          {/* Borrowing Form */}
          <TextInput
            label="Quantity *"
            value={formData.quantity.toString()}
            onChangeText={(text) =>
              setFormData({ ...formData, quantity: parseInt(text) || 0 })
            }
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            right={<TextInput.Affix text={`/ ${item.stock}`} />}
          />

          <DatePickerInput
            label="Start Date *"
            value={formData.start_date}
            onChange={(date) => setFormData({ ...formData, start_date: date })}
            mode="date"
            style={styles.input}
            minimumDate={new Date()}
          />

          <DatePickerInput
            label="End Date *"
            value={formData.end_date}
            onChange={(date) => setFormData({ ...formData, end_date: date })}
            mode="date"
            style={styles.input}
            minimumDate={formData.start_date ? new Date(formData.start_date) : new Date()}
          />

          <TextInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Purpose of borrowing, special requirements, etc."
          />

          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}
          >
            Your borrowing request will be sent to the item owner for approval.
          </Text>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              disabled={submitting}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.actionButton}
            >
              Submit Request
            </Button>
          </View>
        </Card.Content>
      </GlassCard>
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
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemCard: {
    marginBottom: 16,
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  input: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
