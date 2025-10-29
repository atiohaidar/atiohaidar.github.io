import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator, Portal } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Booking, BookingCreate, Room } from '@/types/api';
import BookingList from './components/BookingList';
import CreateBookingDialog from './components/CreateBookingDialog';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [formLoading, setFormLoading] = useState(false);

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
    setFormData((prev) => ({
      ...prev,
      room_id: rooms.length > 0 ? rooms[0].id : prev.room_id,
      title: '',
      description: '',
      start_time: '',
      end_time: '',
    }));
    setDialogVisible(true);
  };

  const handleFormChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Room Bookings
        </Text>
        <BookingList
          bookings={bookings}
          rooms={rooms}
          isAdmin={isAdmin}
          currentUsername={user?.username}
          onUpdateStatus={handleUpdateStatus}
          onCancel={handleCancel}
        />
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={openCreateDialog} label="New Booking" />

      <Portal>
        <CreateBookingDialog
          visible={dialogVisible}
          rooms={rooms}
          formData={formData}
          loading={formLoading}
          onDismiss={() => setDialogVisible(false)}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        />
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
