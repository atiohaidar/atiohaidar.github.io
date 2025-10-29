import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  FAB,
  IconButton,
  useTheme,
  ActivityIndicator,
  Chip,
  Portal,
  Dialog,
  Button,
  TextInput,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import { Booking, BookingCreate, Room } from '../../types/api';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const { user, isAdmin } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, roomsData] = await Promise.all([
        ApiService.listBookings(),
        ApiService.listRooms(),
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCancel = async (booking: Booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await ApiService.cancelBooking(booking.id);
      setBookings(bookings.filter((b) => b.id !== booking.id));
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      alert(error.message || 'Failed to cancel booking');
    }
  };

  const handleUpdateStatus = async (booking: Booking, status: 'approved' | 'rejected') => {
    try {
      const updated = await ApiService.updateBookingStatus(booking.id, { status });
      setBookings(bookings.map((b) => (b.id === booking.id ? updated : b)));
    } catch (error: any) {
      console.error('Failed to update booking:', error);
      alert(error.message || 'Failed to update booking status');
    }
  };

  const openCreateDialog = () => {
    setFormData({
      room_id: rooms.length > 0 ? rooms[0].id : '',
      title: '',
      description: '',
      start_time: '',
      end_time: '',
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.room_id || !formData.title || !formData.start_time || !formData.end_time) {
      alert('Please fill in all required fields');
      return;
    }

    setFormLoading(true);

    try {
      const newBooking: BookingCreate = {
        room_id: formData.room_id,
        title: formData.title,
        description: formData.description || undefined,
        start_time: formData.start_time,
        end_time: formData.end_time,
      };
      const created = await ApiService.createBooking(newBooking);
      setBookings([created, ...bookings]);
      setDialogVisible(false);
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      alert(error.message || 'Failed to create booking');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      case 'cancelled':
        return '#757575';
      default:
        return theme.colors.primary;
    }
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || roomId;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Room Bookings
        </Text>

        {bookings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No bookings yet. Reserve a room!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} style={styles.bookingCard} mode="elevated">
              <Card.Content>
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingInfo}>
                    <Text variant="titleLarge" style={styles.bookingTitle}>
                      {booking.title}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Room: {getRoomName(booking.room_id)}
                    </Text>
                    {booking.description && (
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                      >
                        {booking.description}
                      </Text>
                    )}
                    <View style={styles.bookingMeta}>
                      <Chip
                        icon="clock"
                        compact
                        style={[
                          styles.chip,
                          { backgroundColor: getStatusColor(booking.status) },
                        ]}
                        textStyle={{ color: '#fff' }}
                      >
                        {booking.status.toUpperCase()}
                      </Chip>
                      <Chip icon="calendar-start" compact style={styles.chip}>
                        {new Date(booking.start_time).toLocaleString()}
                      </Chip>
                      <Chip icon="calendar-end" compact style={styles.chip}>
                        {new Date(booking.end_time).toLocaleString()}
                      </Chip>
                      <Chip icon="account" compact style={styles.chip}>
                        {booking.user_username}
                      </Chip>
                    </View>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.actionsRow}>
                  {isAdmin && booking.status === 'pending' && (
                    <>
                      <Button
                        mode="contained"
                        icon="check"
                        onPress={() => handleUpdateStatus(booking, 'approved')}
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                      >
                        Approve
                      </Button>
                      <Button
                        mode="contained"
                        icon="close"
                        onPress={() => handleUpdateStatus(booking, 'rejected')}
                        style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {(booking.user_username === user?.username ||
                    isAdmin) &&
                    booking.status !== 'cancelled' && (
                      <Button
                        mode="outlined"
                        icon="cancel"
                        onPress={() => handleCancel(booking)}
                        style={styles.actionButton}
                      >
                        Cancel
                      </Button>
                    )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={openCreateDialog} label="New Booking" />

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
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
                  onPress={() => setFormData({ ...formData, room_id: room.id })}
                  style={styles.roomButton}
                  disabled={formLoading}
                >
                  {room.name} (Capacity: {room.capacity})
                </Button>
              ))}
              <TextInput
                label="Title *"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
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
                label="Start Time * (YYYY-MM-DDTHH:MM:SSZ)"
                value={formData.start_time}
                onChangeText={(text) => setFormData({ ...formData, start_time: text })}
                mode="outlined"
                style={styles.input}
                placeholder="2024-12-31T09:00:00Z"
                disabled={formLoading}
              />
              <TextInput
                label="End Time * (YYYY-MM-DDTHH:MM:SSZ)"
                value={formData.end_time}
                onChangeText={(text) => setFormData({ ...formData, end_time: text })}
                mode="outlined"
                style={styles.input}
                placeholder="2024-12-31T11:00:00Z"
                disabled={formLoading}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onPress={handleSubmit} loading={formLoading} disabled={formLoading}>
              Create
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
  bookingCard: {
    marginBottom: 12,
    elevation: 2,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    height: 28,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
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
