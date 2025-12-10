import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { TextInput, Chip } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import apiService from '@/services/api';
import { EventScanHistory } from '@/types/api';

export default function EventScanHistoryScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScanner, setSelectedScanner] = useState<string>('all');

  // Fetch event
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiService.getEvent(eventId!),
    enabled: !!eventId,
  });

  // Fetch scan history
  const { data: scanHistory, isLoading } = useQuery({
    queryKey: ['event-scan-history', eventId],
    queryFn: () => apiService.getEventScanHistory(eventId!),
    enabled: !!eventId,
  });

  // Get unique scanners for filter
  const uniqueScanners = useMemo(() => {
    if (!scanHistory) return [];
    return Array.from(new Set(scanHistory.map((s) => s.scanned_by)));
  }, [scanHistory]);

  // Filter scan history
  const filteredScans = useMemo(() => {
    if (!scanHistory) return [];

    return scanHistory.filter((scan) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !scan.attendee_username.toLowerCase().includes(query) &&
          !scan.scanned_by.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Scanner filter
      if (selectedScanner !== 'all' && scan.scanned_by !== selectedScanner) {
        return false;
      }

      return true;
    });
  }, [scanHistory, searchQuery, selectedScanner]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredScans) return { total: 0, unique: 0, present: 0 };

    const uniqueAttendees = new Set(filteredScans.map((s) => s.attendee_username));
    const presentCount = filteredScans.filter((s) => s.attendee_status === 'present').length;

    return {
      total: filteredScans.length,
      unique: uniqueAttendees.size,
      present: presentCount,
    };
  }, [filteredScans]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderScanItem = ({ item }: { item: EventScanHistory }) => (
    <GlassCard style={styles.scanItem} mode="elevated">
      <View style={styles.scanHeader}>
        <Text style={[styles.scanUser, { color: colors.text }]}>{item.attendee_username}</Text>
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor:
                item.attendee_status === 'present' ? '#10b98120' : '#6b728020',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.attendee_status === 'present' ? '#10b981' : '#6b7280' },
            ]}
          >
            {item.attendee_status === 'present' ? 'Hadir' : 'Terdaftar'}
          </Text>
        </View>
      </View>

      <View style={styles.scanDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Waktu Scan:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formatDateTime(item.scanned_at)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Di-scan Oleh:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{item.scanned_by}</Text>
        </View>

        {item.latitude && item.longitude && (
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => {
              const url = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
              Linking.openURL(url);
            }}
          >
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Lokasi:</Text>
            <Text style={[styles.locationLink, { color: colors.primary }]}>
              📍 Lihat di Maps
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </GlassCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Riwayat Scan QR</Text>
        {event && (
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Acara: {event.title}
          </Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <GlassCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Total Scan</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.unique}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Peserta Unik</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.present}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Hadir</Text>
        </GlassCard>
      </View>

      {/* Filters */}
      <GlassCard style={styles.filterSection}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari username atau scanner..."
          mode="outlined"
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
        />

        {uniqueScanners.length > 1 && (
          <View style={styles.scannerFilter}>
            <Text style={[styles.filterLabel, { color: colors.secondaryText }]}>
              Filter Scanner:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.scannerScroll}
            >
              <Chip
                selected={selectedScanner === 'all'}
                onPress={() => setSelectedScanner('all')}
                style={styles.scannerChip}
              >
                Semua
              </Chip>
              {uniqueScanners.map((scanner) => (
                <Chip
                  key={scanner}
                  selected={selectedScanner === scanner}
                  onPress={() => setSelectedScanner(scanner)}
                  style={styles.scannerChip}
                >
                  {scanner}
                </Chip>
              ))}
            </ScrollView>
          </View>
        )}
      </GlassCard>

      {/* Scan History List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            Memuat riwayat...
          </Text>
        </View>
      ) : !filteredScans || filteredScans.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            {searchQuery || selectedScanner !== 'all'
              ? 'Tidak ada riwayat yang sesuai filter'
              : 'Belum ada riwayat scan'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredScans}
          renderItem={renderScanItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
    padding: 16,
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  filterSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  searchInput: {
    marginBottom: 12,
  },
  scannerFilter: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  scannerScroll: {
    flexGrow: 0,
  },
  scannerChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  scanItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanUser: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scanDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLink: {
    fontSize: 14,
    fontWeight: '500',
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
  },
});
