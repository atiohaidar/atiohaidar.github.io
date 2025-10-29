import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, useTheme, Avatar, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import { DashboardStats } from '../../types/api';

export default function HomeScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await ApiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const statCards = [
    ...(isAdmin && stats?.totalUsers
      ? [
          {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: 'account-group',
            color: '#2196F3',
          },
        ]
      : []),
    {
      title: 'Total Tasks',
      value: stats?.totalTasks || 0,
      subtitle: `${stats?.completedTasks || 0} completed`,
      icon: 'checkbox-marked-circle',
      color: '#4CAF50',
    },
    {
      title: 'Articles',
      value: stats?.totalArticles || 0,
      subtitle: `${stats?.publishedArticles || 0} published`,
      icon: 'file-document',
      color: '#FF9800',
    },
    ...(isAdmin && stats?.totalRooms
      ? [
          {
            title: 'Rooms',
            value: stats.totalRooms,
            icon: 'door',
            color: '#9C27B0',
          },
        ]
      : []),
    {
      title: 'Bookings',
      value: stats?.totalBookings || 0,
      subtitle: `${stats?.pendingBookings || 0} pending`,
      icon: 'calendar-check',
      color: '#F44336',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.welcomeText}>
          Welcome, {user?.name || user?.username}!
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {isAdmin ? 'Administrator' : 'Member'}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <Card key={index} style={styles.statCard} mode="elevated">
            <Card.Content style={styles.statCardContent}>
              <Avatar.Icon
                size={48}
                icon={stat.icon}
                style={[styles.statIcon, { backgroundColor: stat.color }]}
              />
              <View style={styles.statTextContainer}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {stat.value}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {stat.title}
                </Text>
                {stat.subtitle && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {stat.subtitle}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Card style={styles.infoCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.infoTitle}>
            Quick Actions
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            • Navigate to Tasks tab to manage your tasks
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            • Check Articles for published content
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            • Visit Bookings to reserve rooms
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            • Use Chat to communicate with others
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsGrid: {
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
