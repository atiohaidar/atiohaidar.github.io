import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconButton, Button } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import QRCode from 'react-native-qrcode-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import apiService from '@/services/api';
import { EventAttendee, AttendeeStatus } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null);

  // Fetch event data
  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiService.getEvent(eventId!),
    enabled: !!eventId,
  });

  // Fetch attendees
  const { data: attendees, isLoading: loadingAttendees } = useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () => apiService.listEventAttendees(eventId!),
    enabled: !!eventId,
  });

  // Fetch admins
  const { data: admins } = useQuery({
    queryKey: ['event-admins', eventId],
    queryFn: () => apiService.listEventAdmins(eventId!),
    enabled: !!eventId,
  });

  // Check permissions
  const currentUserAttendee = attendees?.find((a) => a.user_username === user?.username);
  const isRegistered = !!currentUserAttendee;
  const isCreator = user?.username === event?.created_by;
  const isAdmin = user?.role === 'admin';
  const isEventAdmin = admins?.some((a) => a.user_username === user?.username);
  const canManage = isCreator || isAdmin || isEventAdmin;

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: () => apiService.registerForEvent(eventId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
      Alert.alert('Berhasil', 'Anda telah terdaftar untuk acara ini');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Gagal mendaftar');
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: () => apiService.deleteEvent(eventId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Berhasil', 'Acara telah dihapus');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Gagal menghapus acara');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ attendeeId, status }: { attendeeId: string; status: AttendeeStatus }) =>
      apiService.updateAttendeeStatus(eventId!, attendeeId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Gagal mengubah status');
    },
  });

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

  const getStatusColor = (status: AttendeeStatus) => {
    switch (status) {
      case 'present':
        return '#10b981';
      case 'absent':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: AttendeeStatus) => {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'absent':
        return 'Tidak Hadir';
      default:
        return 'Terdaftar';
    }
  };

  const handleShowQR = (attendee: EventAttendee) => {
    setSelectedAttendee(attendee);
    setShowQRModal(true);
  };

  const handleShareQR = async () => {
    if (!selectedAttendee) return;
    try {
      await Share.share({
        message: `QR Code untuk ${event?.title}\nToken: ${selectedAttendee.attendance_token}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Hapus Acara?',
      'Tindakan ini tidak dapat dibatalkan. Semua data peserta dan admin akan terhapus.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  if (loadingEvent || loadingAttendees) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.secondaryText }}>Memuat detail acara...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Acara tidak ditemukan</Text>
      </View>
    );
  }

  const stats = {
    total: attendees?.length || 0,
    present: attendees?.filter((a) => a.status === 'present').length || 0,
    registered: attendees?.filter((a) => a.status === 'registered').length || 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
          <View style={styles.badgeContainer}>
            {isCreator && (
              <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.badgeText}>Pembuat Acara</Text>
              </View>
            )}
            {isEventAdmin && !isCreator && (
              <View style={[styles.badge, { backgroundColor: '#8b5cf6' }]}>
                <Text style={styles.badgeText}>Admin Acara</Text>
              </View>
            )}
            {isRegistered && (
              <View style={[styles.badge, { backgroundColor: '#10b981' }]}>
                <Text style={styles.badgeText}>Anda Terdaftar</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!isRegistered && (
            <Button
              mode="contained"
              onPress={() => registerMutation.mutate()}
              loading={registerMutation.isPending}
              style={styles.actionButton}
            >
              Daftar Acara
            </Button>
          )}
          {isRegistered && currentUserAttendee && (
            <Button
              mode="contained"
              onPress={() => handleShowQR(currentUserAttendee)}
              icon="qrcode"
              style={styles.actionButton}
            >
              Lihat QR Code Saya
            </Button>
          )}
          {canManage && (
            <View style={styles.manageButtons}>
              <Button
                mode="outlined"
                onPress={() => router.push(`/events/${eventId}/edit`)}
                icon="pencil"
                style={styles.manageButton}
              >
                Edit
              </Button>
              <Button
                mode="contained"
                onPress={() => router.push(`/events/${eventId}/scan`)}
                icon="qrcode-scan"
                style={styles.manageButton}
                buttonColor="#8b5cf6"
              >
                Scan QR
              </Button>
            </View>
          )}
        </View>

        {/* Event Info */}
        <GlassCard style={styles.section}>
          {event.description && (
            <Text style={[styles.description, { color: colors.text }]}>{event.description}</Text>
          )}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
                  Tanggal & Waktu
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(event.event_date)}
                </Text>
              </View>
            </View>
            {event.location && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📍</Text>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Lokasi</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{event.location}</Text>
                </View>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Total Pendaftar
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Hadir</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.present}</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Belum Hadir</Text>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.registered}</Text>
          </GlassCard>
        </View>

        {/* Attendees List (for managers) */}
        {canManage && attendees && attendees.length > 0 && (
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Daftar Peserta ({attendees.length})
            </Text>
            {attendees.slice(0, 5).map((attendee) => (
              <View
                key={attendee.id}
                style={[styles.attendeeItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.attendeeInfo}>
                  <Text style={[styles.attendeeName, { color: colors.text }]}>
                    {attendee.user_username}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(attendee.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(attendee.status) }]}
                    >
                      {getStatusText(attendee.status)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleShowQR(attendee)}>
                  <IconButton icon="qrcode" size={20} />
                </TouchableOpacity>
              </View>
            ))}
            {attendees.length > 5 && (
              <Text style={[styles.moreText, { color: colors.secondaryText }]}>
                dan {attendees.length - 5} peserta lainnya...
              </Text>
            )}
          </GlassCard>
        )}

        {/* Delete Button (admin only) */}
        {(isCreator || isAdmin) && (
          <View style={styles.deleteContainer}>
            <Button
              mode="contained"
              onPress={handleDeleteEvent}
              icon="delete"
              buttonColor="#ef4444"
              loading={deleteMutation.isPending}
            >
              Hapus Acara
            </Button>
          </View>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>QR Code Kehadiran</Text>
            {selectedAttendee && (
              <>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={selectedAttendee.attendance_token}
                    size={200}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
                <Text style={[styles.username, { color: colors.text }]}>
                  {selectedAttendee.user_username}
                </Text>
                <Text style={[styles.token, { color: colors.secondaryText }]}>
                  Token: {selectedAttendee.attendance_token}
                </Text>
                <View style={styles.modalButtons}>
                  <Button mode="outlined" onPress={() => setShowQRModal(false)}>
                    Tutup
                  </Button>
                  <Button mode="contained" onPress={handleShareQR} icon="share-variant">
                    Bagikan
                  </Button>
                </View>
              </>
            )}
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  manageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  manageButton: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  attendeeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  deleteContainer: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  token: {
    fontSize: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
