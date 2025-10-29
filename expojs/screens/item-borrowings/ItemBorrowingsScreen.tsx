import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  ActivityIndicator,
  Card,
  Chip,
  Button,
  useTheme,
  Divider,
} from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { ItemBorrowing, ItemBorrowingStatus } from '@/types/api';

const statusColors: Record<ItemBorrowingStatus, string> = {
  pending: '#FF9800',
  approved: '#4CAF50',
  rejected: '#F44336',
  returned: '#2196F3',
  damaged: '#FF5722',
  extended: '#9C27B0',
};

export default function ItemBorrowingsScreen() {
  const [borrowings, setBorrowings] = useState<ItemBorrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const borrowingsData = await ApiService.listItemBorrowings();
      setBorrowings(borrowingsData);
    } catch (error) {
      console.error('Failed to load borrowings:', error);
      Alert.alert('Error', 'Failed to load borrowings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateStatus = async (
    borrowing: ItemBorrowing,
    status: ItemBorrowingStatus
  ) => {
    try {
      const updated = await ApiService.updateItemBorrowingStatus(borrowing.id, { status });
      setBorrowings(borrowings.map((b) => (b.id === borrowing.id ? updated : b)));
      Alert.alert('Success', 'Status updated successfully');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };

  const handleCancelBorrowing = async (borrowingId: string) => {
    Alert.alert('Cancel Borrowing', 'Are you sure you want to cancel this borrowing?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.cancelItemBorrowing(borrowingId);
            setBorrowings(borrowings.filter((b) => b.id !== borrowingId));
            Alert.alert('Success', 'Borrowing cancelled successfully');
          } catch (error: any) {
            console.error('Failed to cancel borrowing:', error);
            Alert.alert('Error', error.message || 'Failed to cancel borrowing');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading borrowings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {borrowings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No borrowings yet</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Your borrowing requests will appear here
            </Text>
          </View>
        ) : (
          borrowings.map((borrowing) => {
            const statusColor = statusColors[borrowing.status] ?? theme.colors.primary;
            const canCancel =
              (borrowing.borrower_username === user?.username || isAdmin) &&
              borrowing.status === 'pending';

            return (
              <Card key={borrowing.id} style={styles.card} mode="elevated">
                <Card.Content>
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Item ID: {borrowing.item_id}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Chip
                      icon="clipboard-check"
                      compact
                      style={[styles.chip, { backgroundColor: statusColor }]}
                      textStyle={{ color: '#fff' }}
                    >
                      {borrowing.status.toUpperCase()}
                    </Chip>
                    <Chip icon="account" compact style={styles.chip}>
                      {borrowing.borrower_username}
                    </Chip>
                    <Chip icon="package-variant" compact style={styles.chip}>
                      Qty: {borrowing.quantity}
                    </Chip>
                  </View>
                  <View style={styles.dateContainer}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Start: {new Date(borrowing.start_date).toLocaleDateString()}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      End: {new Date(borrowing.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                  {borrowing.notes && (
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
                    >
                      Notes: {borrowing.notes}
                    </Text>
                  )}

                  {(isAdmin || canCancel) && (
                    <>
                      <Divider style={styles.divider} />
                      <View style={styles.actionsRow}>
                        {isAdmin && borrowing.status === 'pending' && (
                          <>
                            <Button
                              mode="contained"
                              icon="check"
                              onPress={() => handleUpdateStatus(borrowing, 'approved')}
                              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                            >
                              Approve
                            </Button>
                            <Button
                              mode="contained"
                              icon="close"
                              onPress={() => handleUpdateStatus(borrowing, 'rejected')}
                              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {isAdmin && borrowing.status === 'approved' && (
                          <Button
                            mode="contained"
                            icon="package-check"
                            onPress={() => handleUpdateStatus(borrowing, 'returned')}
                            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                          >
                            Mark Returned
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            mode="outlined"
                            icon="cancel"
                            onPress={() => handleCancelBorrowing(borrowing.id)}
                            style={styles.actionButton}
                          >
                            Cancel
                          </Button>
                        )}
                      </View>
                    </>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 16,
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
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  dateContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
  },
});
