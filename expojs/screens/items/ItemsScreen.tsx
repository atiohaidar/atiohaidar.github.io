import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Button,
  useTheme,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Item, ItemCreate } from '@/types/api';
import { useRouter } from 'expo-router';

// Memoized Item Card Component
const ItemCard = React.memo(({
  item,
  isOwnerOrAdmin,
  onDelete,
  onBorrow,
  hasUser
}: {
  item: Item;
  isOwnerOrAdmin: boolean;
  onDelete: (id: string) => void;
  onBorrow: (id: string) => void;
  hasUser: boolean;
}) => {
  const theme = useTheme();

  return (
    <GlassCard style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {item.name}
            </Text>
            {item.description && (
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
            <View style={styles.cardMeta}>
              <Chip
                icon="package-variant"
                compact
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      item.stock > 0 ? theme.colors.primaryContainer : theme.colors.errorContainer,
                  },
                ]}
              >
                Stock: {item.stock}
              </Chip>
              <Chip icon="account" compact style={styles.chip}>
                {item.owner_username}
              </Chip>
            </View>
          </View>
          {isOwnerOrAdmin && (
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => onDelete(item.id)}
            />
          )}
        </View>
        {item.stock > 0 && hasUser && (
          <View style={styles.borrowButtonContainer}>
            <Button
              mode="contained"
              icon="hand-extended"
              onPress={() => onBorrow(item.id)}
              style={styles.borrowButton}
            >
              Borrow Item
            </Button>
          </View>
        )}
      </Card.Content>
    </GlassCard>
  );
});

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<ItemCreate>({
    name: '',
    description: '',
    stock: 1,
    attachment_link: '',
  });
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const itemsData = await ApiService.listItems();
      setItems(itemsData);
    } catch (error) {
      console.error('Failed to load items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreateItem = useCallback(async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    setFormLoading(true);
    try {
      const newItem = await ApiService.createItem(formData);
      setItems((prev) => [newItem, ...prev]);
      setDialogVisible(false);
      setFormData({
        name: '',
        description: '',
        stock: 1,
        attachment_link: '',
      });
      Alert.alert('Success', 'Item created successfully');
    } catch (error: any) {
      console.error('Failed to create item:', error);
      Alert.alert('Error', error.message || 'Failed to create item');
    } finally {
      setFormLoading(false);
    }
  }, [formData]);

  const handleDeleteItem = useCallback((itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteItem(itemId);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            Alert.alert('Success', 'Item deleted successfully');
          } catch (error: any) {
            console.error('Failed to delete item:', error);
            Alert.alert('Error', error.message || 'Failed to delete item');
          }
        },
      },
    ]);
  }, []);

  const handleBorrowItem = useCallback((itemId: string) => {
    router.push(`/items/borrow/${itemId}`);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: Item }) => (
    <ItemCard
      item={item}
      isOwnerOrAdmin={user?.username === item.owner_username || isAdmin}
      onDelete={handleDeleteItem}
      onBorrow={handleBorrowItem}
      hasUser={!!user}
    />
  ), [user, isAdmin, handleDeleteItem, handleBorrowItem]);

  const keyExtractor = useCallback((item: Item) => item.id, []);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge">No items yet</Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        Add your first item to get started
      </Text>
    </View>
  ), []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={ListEmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
      />

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Create New Item</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Item Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <TextInput
              label="Stock Quantity *"
              value={formData.stock.toString()}
              onChangeText={(text) => setFormData({ ...formData, stock: parseInt(text) || 0 })}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
            />
            <TextInput
              label="Attachment Link (Optional)"
              value={formData.attachment_link}
              onChangeText={(text) => setFormData({ ...formData, attachment_link: text })}
              mode="outlined"
              keyboardType="url"
              autoCapitalize="none"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onPress={handleCreateItem}
              mode="contained"
              loading={formLoading}
              disabled={formLoading || !formData.name.trim()}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
        label="New Item"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptySubtext: {
    marginTop: 8,
    opacity: 0.6,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  dialog: {
    maxHeight: '90%',
  },
  input: {
    marginBottom: 16,
  },
  borrowButtonContainer: {
    marginTop: 12,
  },
  borrowButton: {
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
