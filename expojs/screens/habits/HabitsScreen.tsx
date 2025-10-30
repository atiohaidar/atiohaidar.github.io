import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, Card, Chip, ProgressBar, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useHabits, useDeleteHabit, useMarkHabitComplete, useUnmarkHabitComplete } from '@/hooks/useApi';
import { HabitWithStats } from '@/types/api';
import HabitFormDialog from './components/HabitFormDialog';

export default function HabitsScreen() {
  const { data: habits = [], isLoading, refetch, isRefetching } = useHabits();
  const deleteHabitMutation = useDeleteHabit();
  const markCompleteMutation = useMarkHabitComplete();
  const unmarkCompleteMutation = useUnmarkHabitComplete();

  const [dialogVisible, setDialogVisible] = useState(false);

  const getPeriodLabel = (periodType: string, periodDays: number) => {
    if (periodType === 'daily') return 'Daily';
    if (periodType === 'weekly') return 'Weekly';
    if (periodType === 'monthly') return 'Monthly';
    return `Every ${periodDays} days`;
  };

  const handleToggleCompletion = async (habit: HabitWithStats) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      if (habit.is_completed_today) {
        await unmarkCompleteMutation.mutateAsync({ habitId: habit.id, date: today });
      } else {
        await markCompleteMutation.mutateAsync({ habitId: habit.id, date: today });
      }
    } catch (error: any) {
      console.error('Failed to toggle completion:', error);
      Alert.alert('Error', error.message || 'Failed to update habit');
    }
  };

  const handleDelete = async (habit: HabitWithStats) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabitMutation.mutateAsync(habit.id);
            } catch (error: any) {
              console.error('Failed to delete habit:', error);
              Alert.alert('Error', error.message || 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const handleViewHistory = (habitId: string) => {
    router.push(`/habits/${habitId}/history`);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading habits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No habits yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create your first habit to get started!
            </Text>
          </View>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <IconButton
                      icon={habit.is_completed_today ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={24}
                      iconColor={habit.is_completed_today ? '#10b981' : undefined}
                      onPress={() => handleToggleCompletion(habit)}
                    />
                    <View style={styles.headerText}>
                      <Text variant="titleMedium">{habit.name}</Text>
                      <Chip mode="outlined" compact style={styles.periodChip}>
                        {getPeriodLabel(habit.period_type, habit.period_days)}
                      </Chip>
                    </View>
                  </View>
                </View>

                {habit.description && (
                  <Text variant="bodyMedium" style={styles.description}>
                    {habit.description}
                  </Text>
                )}

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text variant="labelSmall" style={styles.statLabel}>Streak</Text>
                    <Text variant="bodyMedium" style={styles.streakText}>
                      🔥 {habit.current_streak}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="labelSmall" style={styles.statLabel}>Completed</Text>
                    <Text variant="bodyMedium" style={styles.completedText}>
                      {habit.total_completions}/{habit.total_periods}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="labelSmall" style={styles.statLabel}>Success Rate</Text>
                    <Text variant="bodyMedium" style={styles.successText}>
                      {habit.completion_percentage}%
                    </Text>
                  </View>
                </View>

                <ProgressBar
                  progress={habit.completion_percentage / 100}
                  color="#3b82f6"
                  style={styles.progressBar}
                />

                <View style={styles.actionRow}>
                  <IconButton
                    icon="chart-line"
                    size={20}
                    onPress={() => handleViewHistory(habit.id)}
                  />
                  <Text
                    variant="labelMedium"
                    style={styles.historyLink}
                    onPress={() => handleViewHistory(habit.id)}>
                    View History
                  </Text>
                  <View style={styles.spacer} />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#ef4444"
                    onPress={() => handleDelete(habit)}
                  />
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />

      <HabitFormDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
  },
  periodChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  description: {
    marginTop: 8,
    marginLeft: 40,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginLeft: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  streakText: {
    color: '#f97316',
    fontWeight: 'bold',
  },
  completedText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  successText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  progressBar: {
    marginTop: 12,
    marginLeft: 40,
    height: 8,
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 32,
  },
  historyLink: {
    color: '#3b82f6',
  },
  spacer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
