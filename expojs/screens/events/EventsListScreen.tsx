import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { IconButton, Surface, Chip } from 'react-native-paper';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import apiService from '@/services/api';
import { Event } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

type FilterType = 'all' | 'upcoming' | 'past';

export default function EventsListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: events, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.listEvents(),
  });

  const filterEvents = (eventsList: Event[] | undefined): Event[] => {
    if (!eventsList) return [];
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return eventsList.filter(e => new Date(e.event_date) >= now);
      case 'past':
        return eventsList.filter(e => new Date(e.event_date) < now);
      default:
        return eventsList;
    }
  };

  const filteredEvents = filterEvents(events);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const upcoming = isUpcoming(item.event_date);
    const isCreator = user?.username === item.created_by;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/events/${item.id}`)}
        style={styles.cardTouchable}
      >
        <Surface style={[styles.card, { backgroundColor: colors.card }]} elevation={1}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              {isCreator && (
                <Chip
                  mode="flat"
                  style={styles.creatorChip}
                  textStyle={styles.chipText}
                >
                  Pembuat
                </Chip>
              )}
            </View>
            <Text style={styles.eventIcon}>{upcoming ? '🎉' : '📅'}</Text>
          </View>

          {item.description && (
            <Text
              style={[styles.description, { color: colors.secondaryText }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={[styles.infoText, { color: colors.secondaryText }]} numberOfLines={2}>
                {formatDate(item.event_date)}
              </Text>
            </View>

            {item.location && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={[styles.infoText, { color: colors.secondaryText }]} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}
          </View>

          {!upcoming && (
            <View style={[styles.completedBadge, { borderTopColor: colors.border }]}>
              <Text style={[styles.completedText, { color: colors.secondaryText }]}>
                Acara telah selesai
              </Text>
            </View>
          )}
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Manajemen Acara</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Kelola acara, pendaftaran, dan presensi peserta
          </Text>
        </View>
        {user?.role === 'admin' && (
          <IconButton
            icon="plus-circle"
            size={32}
            iconColor={colors.primary}
            onPress={() => router.push('/events/new')}
          />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: colors.primary },
            filter !== 'all' && { backgroundColor: colors.card },
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' ? styles.filterTextActive : { color: colors.secondaryText },
            ]}
          >
            Semua
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'upcoming' && { backgroundColor: colors.primary },
            filter !== 'upcoming' && { backgroundColor: colors.card },
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'upcoming' ? styles.filterTextActive : { color: colors.secondaryText },
            ]}
          >
            Akan Datang
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'past' && { backgroundColor: colors.primary },
            filter !== 'past' && { backgroundColor: colors.card },
          ]}
          onPress={() => setFilter('past')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'past' ? styles.filterTextActive : { color: colors.secondaryText },
            ]}
          >
            Telah Lewat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      {isLoading && !isRefetching ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            Memuat acara...
          </Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            {filter === 'all'
              ? 'Belum ada acara.'
              : `Tidak ada acara ${filter === 'upcoming' ? 'yang akan datang' : 'yang telah lewat'}.`}
          </Text>
          {filter === 'all' && user?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/events/new')}
            >
              <Text style={styles.createButtonText}>Buat Acara Pertama</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  cardTouchable: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  creatorChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 24,
    backgroundColor: '#3b82f6',
  },
  chipText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginVertical: 0,
    marginHorizontal: 8,
  },
  eventIcon: {
    fontSize: 32,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  completedBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  completedText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
