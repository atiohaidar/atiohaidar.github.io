import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Divider, Button, useTheme } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import { Ticket } from '@/types/api';

interface TicketCardProps {
  ticket: Ticket;
  isAdmin: boolean;
  onPress: (ticket: Ticket) => void;
  onUpdateStatus?: (ticket: Ticket, status: 'in_progress' | 'solved') => void;
}

const statusColors: Record<Ticket['status'], string> = {
  open: '#FF9800',
  in_progress: '#2196F3',
  waiting: '#9C27B0',
  solved: '#4CAF50',
};

const priorityColors: Record<Ticket['priority'], string> = {
  low: '#8BC34A',
  medium: '#FF9800',
  high: '#FF5722',
  critical: '#F44336',
};

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  isAdmin,
  onPress,
  onUpdateStatus,
}) => {
  const theme = useTheme();

  const statusColor = statusColors[ticket.status] ?? theme.colors.primary;
  const priorityColor = priorityColors[ticket.priority] ?? theme.colors.secondary;

  return (
    <GlassCard style={styles.card} mode="elevated" onPress={() => onPress(ticket)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.title}>
              #{ticket.id} - {ticket.title}
            </Text>
            {ticket.category_name && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {ticket.category_name}
              </Text>
            )}
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
              numberOfLines={2}
            >
              {ticket.description}
            </Text>
            <View style={styles.meta}>
              <Chip
                icon="flag"
                compact
                style={[styles.chip, { backgroundColor: priorityColor }]}
                textStyle={{ color: '#fff' }}
              >
                {ticket.priority.toUpperCase()}
              </Chip>
              <Chip
                icon="progress-check"
                compact
                style={[styles.chip, { backgroundColor: statusColor }]}
                textStyle={{ color: '#fff' }}
              >
                {ticket.status.replace('_', ' ').toUpperCase()}
              </Chip>
              {ticket.submitter_name && (
                <Chip icon="account" compact style={styles.chip}>
                  {ticket.submitter_name}
                </Chip>
              )}
              {ticket.assigned_to && (
                <Chip icon="account-check" compact style={styles.chip}>
                  Assigned: {ticket.assigned_to}
                </Chip>
              )}
            </View>
          </View>
        </View>

        {isAdmin && ticket.status !== 'solved' && onUpdateStatus && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.actionsRow}>
              {ticket.status === 'open' && (
                <Button
                  mode="contained"
                  icon="progress-check"
                  onPress={() => onUpdateStatus(ticket, 'in_progress')}
                  style={styles.actionButton}
                >
                  Start
                </Button>
              )}
              <Button
                mode="contained"
                icon="check-circle"
                onPress={() => onUpdateStatus(ticket, 'solved')}
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              >
                Resolve
              </Button>
            </View>
          </>
        )}
      </Card.Content>
    </GlassCard>
  );
};

export default memo(TicketCard);

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
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
