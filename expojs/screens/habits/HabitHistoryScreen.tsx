import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, DataTable } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useHabit, useHabitCompletions } from '@/hooks/useApi';

type DateRange = 'week' | 'month' | '3months' | 'all';

export default function HabitHistoryScreen() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const [dateRange, setDateRange] = useState<DateRange>('month');

  const { data: habit, isLoading: habitLoading, refetch: refetchHabit } = useHabit(habitId!);
  const { data: completions = [], isLoading: completionsLoading, refetch: refetchCompletions } = useHabitCompletions(
    habitId!,
    getStartDate(),
    undefined
  );

  function getStartDate(): string | undefined {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        now.setDate(now.getDate() - 7);
        return now.toISOString().split('T')[0];
      case 'month':
        now.setMonth(now.getMonth() - 1);
        return now.toISOString().split('T')[0];
      case '3months':
        now.setMonth(now.getMonth() - 3);
        return now.toISOString().split('T')[0];
      case 'all':
        return undefined;
    }
  }

  function generateDateRange(): string[] {
    if (!habit) return [];

    const startDate = new Date(habit.created_at || new Date());
    const endDate = new Date();
    const dates: string[] = [];

    const rangeStartDate = getStartDate();
    const actualStartDate = rangeStartDate
      ? new Date(Math.max(new Date(rangeStartDate).getTime(), startDate.getTime()))
      : startDate;

    const current = new Date(actualStartDate);
    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates.reverse();
  }

  function isCompleted(date: string): boolean {
    return completions.some(c => c.completion_date === date);
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = dateStr;
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayStr) return 'Today';
    if (dateOnly === yesterdayStr) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }

  function calculateStats(dates: string[]) {
    const totalDays = dates.length;
    const completedDays = dates.filter(date => isCompleted(date)).length;
    const missedDays = totalDays - completedDays;
    const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return { totalDays, completedDays, missedDays, percentage };
  }

  const getPeriodLabel = (periodType: string, periodDays: number) => {
    if (periodType === 'daily') return 'Daily';
    if (periodType === 'weekly') return 'Weekly';
    if (periodType === 'monthly') return 'Monthly';
    return `Every ${periodDays} days`;
  };

  if (habitLoading || completionsLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading history...</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.centerContainer}>
        <Text>Habit not found</Text>
      </View>
    );
  }

  const dates = generateDateRange();
  const stats = calculateStats(dates);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            refetchHabit();
            refetchCompletions();
          }}
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall">{habit.name}</Text>
        {habit.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {habit.description}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text variant="bodySmall" style={styles.metaText}>
            {getPeriodLabel(habit.period_type, habit.period_days)}
          </Text>
          <Text variant="bodySmall" style={styles.metaText}>
            Started: {new Date(habit.created_at || '').toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={dateRange}
          onValueChange={(value) => setDateRange(value as DateRange)}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: '3months', label: '3 Mo' },
            { value: 'all', label: 'All' },
          ]}
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="labelSmall">Total Days</Text>
            <Text variant="headlineMedium">{stats.totalDays}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="labelSmall">Completed</Text>
            <Text variant="headlineMedium" style={styles.completedText}>
              {stats.completedDays}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="labelSmall">Missed</Text>
            <Text variant="headlineMedium" style={styles.missedText}>
              {stats.missedDays}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="labelSmall">Success Rate</Text>
            <Text variant="headlineMedium" style={styles.successText}>
              {stats.percentage}%
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* History Table */}
      <Card style={styles.tableCard}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Date</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>

          {dates.map((date) => {
            const completed = isCompleted(date);
            return (
              <DataTable.Row key={date}>
                <DataTable.Cell>
                  <View>
                    <Text>{formatDate(date)}</Text>
                    <Text variant="bodySmall" style={styles.dateSecondary}>
                      {date}
                    </Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      completed ? styles.completedChip : styles.missedChip,
                    ]}>
                    {completed ? '✓ Completed' : '✗ Missed'}
                  </Chip>
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}

          {dates.length === 0 && (
            <View style={styles.emptyTable}>
              <Text>No data available for the selected period</Text>
            </View>
          )}
        </DataTable>
      </Card>

      {/* Overall Performance */}
      <Card style={styles.performanceCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.performanceTitle}>
            Overall Performance
          </Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceStat}>
              <Text variant="labelSmall">Current Streak:</Text>
              <Text variant="bodyMedium" style={styles.streakText}>
                🔥 {habit.current_streak}
              </Text>
            </View>
            <View style={styles.performanceStat}>
              <Text variant="labelSmall">Total Completed:</Text>
              <Text variant="bodyMedium">
                {habit.total_completions}/{habit.total_periods}
              </Text>
            </View>
            <View style={styles.performanceStat}>
              <Text variant="labelSmall">Overall Success:</Text>
              <Text variant="bodyMedium" style={styles.successText}>
                {habit.completion_percentage}%
              </Text>
            </View>
            <View style={styles.performanceStat}>
              <Text variant="labelSmall">Status Today:</Text>
              <Text
                variant="bodyMedium"
                style={habit.is_completed_today ? styles.completedText : styles.pendingText}>
                {habit.is_completed_today ? '✓ Done' : '○ Pending'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
  header: {
    padding: 16,
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    color: '#666',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  completedText: {
    color: '#10b981',
  },
  missedText: {
    color: '#ef4444',
  },
  successText: {
    color: '#3b82f6',
  },
  streakText: {
    color: '#f97316',
  },
  pendingText: {
    color: '#666',
  },
  tableCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  dateSecondary: {
    color: '#666',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  completedChip: {
    backgroundColor: '#dcfce7',
  },
  missedChip: {
    backgroundColor: '#fee2e2',
  },
  emptyTable: {
    padding: 32,
    alignItems: 'center',
  },
  performanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  performanceTitle: {
    marginBottom: 12,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  performanceStat: {
    flex: 1,
    minWidth: '45%',
  },
});
