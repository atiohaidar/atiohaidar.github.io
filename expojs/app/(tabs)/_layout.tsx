import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { IconButton } from 'react-native-paper';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { logout, isAdmin } = useAuth();

  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        drawerPosition: 'left',
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Beranda',
          drawerLabel: 'Beranda',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="home" size={size} iconColor={color} />
          ),
          headerRight: () => (
            <IconButton
              icon="logout"
              size={24}
              onPress={logout}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="tasks"
        options={{
          title: 'Tugas',
          drawerLabel: 'Tugas',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="checkbox-marked-circle" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="articles"
        options={{
          title: 'Artikel',
          drawerLabel: 'Artikel',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="newspaper" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: 'Pemesanan',
          drawerLabel: 'Pemesanan',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="calendar" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="chat"
        options={{
          title: 'Obrolan',
          drawerLabel: 'Obrolan',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="chat" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="tickets"
        options={{
          title: 'Tiket',
          drawerLabel: 'Tiket',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="ticket" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="forms"
        options={{
          title: 'Formulir',
          drawerLabel: 'Formulir',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="form-select" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="items"
        options={{
          title: 'Barang',
          drawerLabel: 'Barang',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="package-variant" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="item-borrowings"
        options={{
          title: 'Peminjaman',
          drawerLabel: 'Peminjaman',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="clipboard-list" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="discussions"
        options={{
          title: 'Diskusi',
          drawerLabel: 'Diskusi',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="forum" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          title: 'Acara',
          drawerLabel: 'Acara',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="calendar-star" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profil',
          drawerLabel: 'Profil',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="account" size={size} iconColor={color} />
          ),
        }}
      />
      {/* Admin-only menu: Users Management */}
      <Drawer.Screen
        name="users"
        options={{
          title: 'Pengguna',
          drawerLabel: 'Pengguna (Admin)',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="account-group" size={size} iconColor={color} />
          ),
          // Hide from drawer for non-admin users
          drawerItemStyle: isAdmin ? undefined : { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifikasi',
          drawerLabel: 'Notifikasi',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="bell" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="transactions"
        options={{
          title: 'Riwayat Transaksi',
          drawerLabel: 'Transaksi',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="history" size={size} iconColor={color} />
          ),
        }}
      />
    </Drawer>
  );
}
