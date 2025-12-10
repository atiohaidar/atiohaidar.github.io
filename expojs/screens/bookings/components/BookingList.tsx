import React from 'react';
import { View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';

import { Booking, Room } from '@/types/api';
import BookingCard from './BookingCard';

interface BookingListProps {
  bookings: Booking[];
  rooms: Room[];
  isAdmin: boolean;
  currentUsername?: string;
  onUpdateStatus: (booking: Booking, status: 'approved' | 'rejected') => void;
  onCancel: (booking: Booking) => void;
}

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  rooms,
  isAdmin,
  currentUsername,
  onUpdateStatus,
  onCancel,
}) => {
  const getRoomName = (roomId: string) => rooms.find((room) => room.id === roomId)?.name ?? roomId;

  if (bookings.length === 0) {
    return (
      <GlassCard style={{ marginTop: 20 }}>
        <Card.Content>
          <Text variant="bodyLarge" style={{ textAlign: 'center', opacity: 0.6 }}>
            No bookings yet. Reserve a room!
          </Text>
        </Card.Content>
      </GlassCard>
    );
  }

  return (
    <View>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          roomName={getRoomName(booking.room_id)}
          isAdmin={isAdmin}
          currentUsername={currentUsername}
          onUpdateStatus={onUpdateStatus}
          onCancel={onCancel}
        />
      ))}
    </View>
  );
};

export default React.memo(BookingList);
