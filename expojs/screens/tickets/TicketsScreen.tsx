import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, ActivityIndicator, Searchbar, Chip, Portal } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Ticket, TicketCreate, TicketCategory, TicketStatus } from '@/types/api';
import TicketCard from './components/TicketCard';
import CreateTicketDialog from './components/CreateTicketDialog';
import { useRouter } from 'expo-router';

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter]);

  const loadData = async () => {
    try {
      const [ticketsData, categoriesData] = await Promise.all([
        ApiService.listTickets(),
        ApiService.listTicketCategories(),
      ]);
      setTickets(ticketsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.id.toString().includes(query)
      );
    }

    setFilteredTickets(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateTicket = async (ticketData: TicketCreate) => {
    setFormLoading(true);
    try {
      const newTicket = await ApiService.createTicket(ticketData);
      setTickets([newTicket, ...tickets]);
      setDialogVisible(false);
      Alert.alert(
        'Success',
        `Ticket created successfully! Token: ${newTicket.token}\n\nSave this token to track your ticket.`
      );
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      Alert.alert('Error', error.message || 'Failed to create ticket');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (ticket: Ticket, status: 'in_progress' | 'solved') => {
    try {
      const updated = await ApiService.updateTicket(ticket.id, { status });
      setTickets(tickets.map((t) => (t.id === ticket.id ? updated : t)));
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      Alert.alert('Error', error.message || 'Failed to update ticket status');
    }
  };

  const handleTicketPress = (ticket: Ticket) => {
    router.push(`/tickets/${ticket.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading tickets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search tickets..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipContainer}
        >
          <Chip
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={statusFilter === 'open'}
            onPress={() => setStatusFilter('open')}
            style={styles.filterChip}
          >
            Open
          </Chip>
          <Chip
            selected={statusFilter === 'in_progress'}
            onPress={() => setStatusFilter('in_progress')}
            style={styles.filterChip}
          >
            In Progress
          </Chip>
          <Chip
            selected={statusFilter === 'waiting'}
            onPress={() => setStatusFilter('waiting')}
            style={styles.filterChip}
          >
            Waiting
          </Chip>
          <Chip
            selected={statusFilter === 'solved'}
            onPress={() => setStatusFilter('solved')}
            style={styles.filterChip}
          >
            Solved
          </Chip>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No tickets found</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {statusFilter !== 'all'
                ? 'Try changing the filter'
                : 'Create your first ticket to get started'}
            </Text>
          </View>
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              isAdmin={isAdmin}
              onPress={handleTicketPress}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </ScrollView>

      <Portal>
        <CreateTicketDialog
          visible={dialogVisible}
          categories={categories}
          onDismiss={() => setDialogVisible(false)}
          onCreate={handleCreateTicket}
          loading={formLoading}
        />
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
        label="New Ticket"
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
