import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useStats } from '@/hooks/useApi';
import { AppColors } from '@/constants/colors';
import { GlassCard } from '@/components/GlassCard';

export default function HomeScreen() {
  const { data: stats, isLoading, refetch, isRefetching } = useStats();
  const { user, isAdmin, refreshUser } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleRefresh = async () => {
    await Promise.all([refetch(), refreshUser()]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  const statCards = [
    ...(isAdmin && stats?.totalUsers
      ? [
        {
          title: 'Total Pengguna',
          value: stats.totalUsers,
          icon: 'account-group',
          color: AppColors.statBlue,
        },
      ]
      : []),
    {
      title: 'Total Tugas',
      value: stats?.totalTasks || 0,
      subtitle: `${stats?.completedTasks || 0} selesai`,
      icon: 'checkbox-marked-circle',
      color: AppColors.statGreen,
    },
    {
      title: 'Artikel',
      value: stats?.totalArticles || 0,
      subtitle: `${stats?.publishedArticles || 0} dipublikasikan`,
      icon: 'file-document',
      color: AppColors.statOrange,
    },
    ...(isAdmin && stats?.totalRooms
      ? [
        {
          title: 'Ruangan',
          value: stats.totalRooms,
          icon: 'door',
          color: AppColors.statPurple,
        },
      ]
      : []),
    {
      title: 'Pemesanan',
      value: stats?.totalBookings || 0,
      subtitle: `${stats?.pendingBookings || 0} menunggu`,
      icon: 'calendar-check',
      color: AppColors.statRed,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={theme.colors.onSurface} />
      }
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
          Selamat Datang, {user?.name || user?.username}!
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {isAdmin ? 'Administrator' : 'Anggota'}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {/* Balance Card */}
        <GlassCard style={styles.statCard} mode="elevated">
          <View style={styles.statCardContent}>
            <Avatar.Icon
              size={48}
              icon="wallet"
              style={[styles.statIcon, { backgroundColor: AppColors.statGreen }]}
              color="#FFF"
            />
            <View style={styles.statTextContainer}>
              <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                Rp {(user?.balance ?? 0).toLocaleString('id-ID')}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                Total Saldo
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {isAdmin && (
                <Button
                  mode="contained"
                  onPress={() => router.push('/topup')}
                  style={{ backgroundColor: AppColors.statPurple }}
                  compact
                >
                  Top Up
                </Button>
              )}
              <Button
                mode="contained"
                onPress={() => router.push('/transfer')}
                style={{ backgroundColor: AppColors.statGreen }}
                compact
              >
                Transfer
              </Button>
            </View>
          </View>
        </GlassCard>

        {statCards.map((stat, index) => (
          <GlassCard key={index} style={styles.statCard} mode="elevated">
            <View style={styles.statCardContent}>
              <Avatar.Icon
                size={48}
                icon={stat.icon}
                style={[styles.statIcon, { backgroundColor: stat.color }]}
                color="#FFF"
              />
              <View style={styles.statTextContainer}>
                <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                  {stat.value}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {stat.title}
                </Text>
                {stat.subtitle && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {stat.subtitle}
                  </Text>
                )}
              </View>
            </View>
          </GlassCard>
        ))}
      </View>

      <GlassCard style={styles.infoCard} mode="elevated">
        <View style={{ padding: 16 }}>
          <Text variant="titleMedium" style={[styles.infoTitle, { color: theme.colors.onSurface }]}>
            Aksi Cepat
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            • Buka tab Tugas untuk mengelola tugas Anda
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            • Cek Artikel untuk konten yang dipublikasikan
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            • Kunjungi Pemesanan untuk reservasi ruangan
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            • Gunakan Chat untuk berkomunikasi dengan orang lain
          </Text>
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
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
    // GlassCard handles background and border
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
