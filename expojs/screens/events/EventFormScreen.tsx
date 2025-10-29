import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TextInput, Button } from 'react-native-paper';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import apiService from '@/services/api';
import { Event, EventCreate, EventUpdate } from '@/types/api';

export default function EventFormScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const queryClient = useQueryClient();
  const isEditMode = !!eventId && eventId !== 'new';

  const [formData, setFormData] = useState<EventCreate>({
    title: '',
    description: '',
    event_date: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch event data if editing
  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => apiService.getEvent(eventId!),
    enabled: isEditMode,
  });

  // Populate form when editing
  useEffect(() => {
    if (event && isEditMode) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date,
        location: event.location || '',
      });
    }
  }, [event, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: apiService.createEvent.bind(apiService),
    onSuccess: (data: Event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Berhasil', 'Acara telah dibuat');
      router.replace(`/events/${data.id}`);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Gagal membuat acara');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: EventUpdate) => apiService.updateEvent(eventId!, data),
    onSuccess: (data: Event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      Alert.alert('Berhasil', 'Acara telah diperbarui');
      router.replace(`/events/${data.id}`);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Gagal memperbarui acara');
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul acara harus diisi';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Tanggal dan waktu acara harus diisi';
    } else {
      const eventDate = new Date(formData.event_date);
      if (eventDate < new Date() && !isEditMode) {
        newErrors.event_date = 'Tanggal acara tidak boleh di masa lalu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof EventCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Helper to format date for datetime-local input
  const formatDateForInput = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  if (isEditMode && loadingEvent) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.secondaryText }}>Memuat data acara...</Text>
      </View>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditMode ? 'Edit Acara' : 'Buat Acara Baru'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              {isEditMode ? 'Perbarui informasi acara' : 'Buat acara dan kelola pendaftaran peserta'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.fieldContainer}>
              <TextInput
                label="Judul Acara *"
                value={formData.title}
                onChangeText={(value) => handleChange('title', value)}
                error={!!errors.title}
                disabled={isSubmitting}
                mode="outlined"
                placeholder="Contoh: Workshop Web Development"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <TextInput
                label="Deskripsi"
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                disabled={isSubmitting}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Jelaskan tentang acara ini..."
              />
            </View>

            {/* Event Date - Note: For simplicity, using text input with placeholder */}
            <View style={styles.fieldContainer}>
              <TextInput
                label="Tanggal dan Waktu *"
                value={formData.event_date ? formatDateForInput(formData.event_date) : ''}
                onChangeText={(value) => {
                  // Convert from datetime-local format to ISO
                  try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      handleChange('event_date', date.toISOString());
                    }
                  } catch {
                    handleChange('event_date', value);
                  }
                }}
                error={!!errors.event_date}
                disabled={isSubmitting}
                mode="outlined"
                placeholder="YYYY-MM-DDTHH:MM (contoh: 2024-12-31T14:00)"
              />
              {errors.event_date && <Text style={styles.errorText}>{errors.event_date}</Text>}
              <Text style={[styles.helperText, { color: colors.secondaryText }]}>
                Format: YYYY-MM-DDTHH:MM (contoh: 2024-12-31T14:00)
              </Text>
            </View>

            {/* Location */}
            <View style={styles.fieldContainer}>
              <TextInput
                label="Lokasi"
                value={formData.location}
                onChangeText={(value) => handleChange('location', value)}
                disabled={isSubmitting}
                mode="outlined"
                placeholder="Contoh: Auditorium Utama"
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                disabled={isSubmitting}
                style={styles.button}
              >
                Batal
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={[styles.button, styles.submitButton]}
              >
                {isEditMode ? 'Perbarui Acara' : 'Buat Acara'}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
