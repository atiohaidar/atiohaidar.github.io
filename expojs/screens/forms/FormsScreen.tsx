import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, ActivityIndicator, Card, Chip, IconButton, useTheme } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Form } from '@/types/api';
import { useRouter } from 'expo-router';

export default function FormsScreen() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const formsData = await ApiService.listForms();
      setForms(formsData);
    } catch (error) {
      console.error('Failed to load forms:', error);
      Alert.alert('Error', 'Failed to load forms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDeleteForm = async (formId: string) => {
    Alert.alert('Delete Form', 'Are you sure you want to delete this form?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteForm(formId);
            setForms(forms.filter((f) => f.id !== formId));
            Alert.alert('Success', 'Form deleted successfully');
          } catch (error: any) {
            console.error('Failed to delete form:', error);
            Alert.alert('Error', error.message || 'Failed to delete form');
          }
        },
      },
    ]);
  };

  const handleShareForm = (form: Form) => {
    Alert.alert(
      'Share Form',
      `Form Token: ${form.token}\n\nShare this token with respondents to fill out the form.`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading forms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {forms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No forms yet</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create your first form to get started
            </Text>
          </View>
        ) : (
          forms.map((form) => (
            <Card
              key={form.id}
              style={styles.card}
              mode="elevated"
              onPress={() => router.push(`/form/${form.id}`)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {form.title}
                    </Text>
                    {form.description && (
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.onSurfaceVariant }}
                        numberOfLines={2}
                      >
                        {form.description}
                      </Text>
                    )}
                    <View style={styles.cardMeta}>
                      <Chip icon="clock-outline" compact style={styles.chip}>
                        {new Date(form.created_at || '').toLocaleDateString()}
                      </Chip>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <IconButton
                      icon="share-variant"
                      size={20}
                      onPress={() => handleShareForm(form)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={theme.colors.error}
                      onPress={() => handleDeleteForm(form.id)}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/form/create')}
        label="New Form"
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
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  cardActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
