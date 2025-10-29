import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { Button, TextInput, Surface } from 'react-native-paper';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import apiService from '@/services/api';
import { EventAttendee } from '@/types/api';

export default function EventScanScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [lastScan, setLastScan] = useState<{
    attendee: EventAttendee;
    isFirstScan: boolean;
    timestamp: Date;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Fetch event
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiService.getEvent(eventId!),
    enabled: !!eventId,
  });

  // Fetch attendees for verification
  const { data: attendees } = useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () => apiService.listEventAttendees(eventId!),
    enabled: !!eventId,
  });

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: (token: string) =>
      apiService.scanAttendance(eventId!, {
        attendance_token: token,
        latitude: location?.latitude,
        longitude: location?.longitude,
      }),
    onSuccess: (data) => {
      setLastScan({
        attendee: data.attendee,
        isFirstScan: data.isFirstScan,
        timestamp: new Date(),
      });
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
      setShowConfirmModal(false);
      setPendingToken(null);
      setManualToken('');
      // Auto-clear last scan after 5 seconds
      setTimeout(() => setLastScan(null), 5000);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Gagal memproses scan');
      setShowConfirmModal(false);
      setPendingToken(null);
    },
  });

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Get user's location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (error) {
        console.warn('Could not get location:', error);
      }
    })();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isScanning) return;
    
    // Stop scanning temporarily
    setIsScanning(false);
    
    // Show confirmation modal
    setPendingToken(data);
    setShowConfirmModal(true);
  };

  const handleManualSubmit = () => {
    if (manualToken.trim()) {
      setPendingToken(manualToken.trim());
      setShowConfirmModal(true);
    }
  };

  const handleConfirmScan = () => {
    if (pendingToken) {
      scanMutation.mutate(pendingToken);
    }
  };

  const handleCancelScan = () => {
    setShowConfirmModal(false);
    setPendingToken(null);
    setManualToken('');
  };

  const getAttendeeInfo = (token: string) => {
    return attendees?.find((a) => a.attendance_token === token);
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.secondaryText }}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Izin kamera tidak diberikan
        </Text>
        <Text style={[styles.helperText, { color: colors.secondaryText }]}>
          Gunakan input manual untuk memindai token
        </Text>
        <Button
          mode="contained"
          onPress={() => setShowManualInput(true)}
          style={styles.button}
        >
          Input Manual
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Scan QR Code</Text>
        {event && (
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Acara: {event.title}
          </Text>
        )}
      </View>

      {/* Last scan notification */}
      {lastScan && (
        <View
          style={[
            styles.notification,
            {
              backgroundColor: lastScan.isFirstScan
                ? colors.notification || '#10b98120'
                : colors.info || '#3b82f620',
            },
          ]}
        >
          <Text
            style={[
              styles.notificationText,
              { color: lastScan.isFirstScan ? '#10b981' : '#3b82f6' },
            ]}
          >
            {lastScan.isFirstScan ? '✅ Scan pertama - Status diubah ke HADIR' : '✅ Scan berhasil dicatat'}
          </Text>
          <Text
            style={[
              styles.notificationSubtext,
              { color: lastScan.isFirstScan ? '#10b981' : '#3b82f6' },
            ]}
          >
            User: {lastScan.attendee.user_username} | {lastScan.timestamp.toLocaleTimeString('id-ID')}
          </Text>
        </View>
      )}

      {/* Camera Scanner */}
      <View style={styles.cameraContainer}>
        {isScanning ? (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Arahkan kamera ke QR Code</Text>
            </View>
          </CameraView>
        ) : (
          <View style={[styles.cameraPlaceholder, { backgroundColor: colors.card }]}>
            <Text style={[styles.placeholderText, { color: colors.secondaryText }]}>
              Kamera tidak aktif
            </Text>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={() => setIsScanning(!isScanning)}
          style={styles.controlButton}
          buttonColor={isScanning ? '#ef4444' : colors.primary}
        >
          {isScanning ? 'Stop Scanner' : 'Mulai Scanner'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setShowManualInput(!showManualInput)}
          style={styles.controlButton}
        >
          Input Manual
        </Button>
      </View>

      {/* Manual Input */}
      {showManualInput && (
        <Surface style={[styles.manualInputSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Input Token Manual</Text>
          <TextInput
            value={manualToken}
            onChangeText={setManualToken}
            placeholder="Masukkan token dari QR code"
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleManualSubmit}
            disabled={!manualToken.trim() || scanMutation.isPending}
            loading={scanMutation.isPending}
          >
            Verifikasi Token
          </Button>
        </Surface>
      )}

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Verifikasi Kehadiran</Text>

            {(() => {
              const attendee = pendingToken ? getAttendeeInfo(pendingToken) : null;
              if (!attendee) {
                return (
                  <>
                    <View style={styles.errorBox}>
                      <Text style={styles.errorBoxText}>
                        ❌ Token tidak valid atau peserta tidak terdaftar
                      </Text>
                    </View>
                    <Button mode="contained" onPress={handleCancelScan} style={styles.modalButton}>
                      Tutup
                    </Button>
                  </>
                );
              }

              return (
                <>
                  <View style={styles.attendeePreview}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>👤</Text>
                    </View>
                    <View>
                      <Text style={[styles.attendeeName, { color: colors.text }]}>
                        {attendee.user_username}
                      </Text>
                      <Text style={[styles.attendeeStatus, { color: colors.secondaryText }]}>
                        Status saat ini:{' '}
                        {attendee.status === 'present'
                          ? 'Hadir'
                          : attendee.status === 'absent'
                          ? 'Tidak Hadir'
                          : 'Terdaftar'}
                      </Text>
                    </View>
                  </View>

                  {attendee.status === 'present' && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoBoxText}>
                        ℹ️ Peserta ini sudah pernah hadir. Scan ini akan dicatat sebagai scan
                        tambahan.
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.confirmText, { color: colors.secondaryText }]}>
                    Apakah ini orang yang benar?
                  </Text>

                  <View style={styles.modalButtons}>
                    <Button
                      mode="outlined"
                      onPress={handleCancelScan}
                      disabled={scanMutation.isPending}
                      style={styles.modalButton}
                    >
                      Batalkan
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleConfirmScan}
                      disabled={scanMutation.isPending}
                      loading={scanMutation.isPending}
                      style={styles.modalButton}
                      buttonColor="#10b981"
                    >
                      Ya, Konfirmasi
                    </Button>
                  </View>
                </>
              );
            })()}
          </Surface>
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
    padding: 32,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  notification: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationSubtext: {
    fontSize: 12,
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
  },
  manualInputSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  attendeePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  attendeeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  attendeeStatus: {
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBoxText: {
    color: '#dc2626',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBoxText: {
    color: '#1e40af',
    fontSize: 12,
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
