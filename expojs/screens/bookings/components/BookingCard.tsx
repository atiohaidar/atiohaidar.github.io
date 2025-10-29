import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Divider, Button, useTheme } from 'react-native-paper';

import { Booking } from '@/types/api';

interface BookingCardProps {
  booking: Booking;
  roomName: string;
  isAdmin: boolean;
  currentUsername?: string;
  onUpdateStatus: (booking: Booking, status: 'approved' | 'rejected') => void;
  onCancel: (booking: Booking) => void;
}

const statusColors: Record<Booking['status'], string> = {
  approved: '#4CAF50',
  pending: '#FF9800',
  rejected: '#F44336',
  cancelled: '#757575',
};

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  roomName,
  isAdmin,
  currentUsername,
  onUpdateStatus,
  onCancel,
}) => {
  const theme = useTheme();

  const statusColor = statusColors[booking.status] ?? theme.colors.primary;
  const canCancel =
    (booking.user_username === currentUsername || isAdmin) && booking.status !== 'cancelled';

  return (
    <Card key={booking.id} style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text variant="titleLarge" style={styles.title}>
              {booking.title}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Room: {roomName}
            </Text>
            {booking.description ? (
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
              >
                {booking.description}
              </Text>
            ) : null}
            <View style={styles.meta}>
              <Chip
                icon="clock"
                compact
                style={[styles.chip, { backgroundColor: statusColor }]}
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
          {isAdmin && booking.status === 'pending' ? (
            <>
              <Button
                mode="contained"
                icon="check"
                onPress={() => onUpdateStatus(booking, 'approved')}
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              >
                Approve
              </Button>
              <Button
                mode="contained"
                icon="close"
                onPress={() => onUpdateStatus(booking, 'rejected')}
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              >
                Reject
              </Button>
            </>
          ) : null}

          {canCancel ? (
            <Button
              mode="outlined"
              icon="cancel"
              onPress={() => onCancel(booking)}
              style={styles.actionButton}
            >
              Cancel
            </Button>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
};

export default memo(BookingCard);

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  meta: {
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
});
