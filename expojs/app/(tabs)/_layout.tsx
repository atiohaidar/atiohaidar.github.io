import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { IconButton } from 'react-native-paper';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { logout } = useAuth();

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
          title: 'Home',
          drawerLabel: 'Home',
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
          title: 'Tasks',
          drawerLabel: 'Tasks',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="checkbox-marked-circle" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="articles"
        options={{
          title: 'Articles',
          drawerLabel: 'Articles',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="newspaper" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          drawerLabel: 'Bookings',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="calendar" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="chat"
        options={{
          title: 'Chat',
          drawerLabel: 'Chat',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="chat" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          drawerLabel: 'Tickets',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="ticket" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="forms"
        options={{
          title: 'Forms',
          drawerLabel: 'Forms',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="form-select" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="items"
        options={{
          title: 'Items',
          drawerLabel: 'Items',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="package-variant" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="item-borrowings"
        options={{
          title: 'Borrowings',
          drawerLabel: 'Borrowings',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="clipboard-list" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="discussions"
        options={{
          title: 'Discussions',
          drawerLabel: 'Discussions',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="forum" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          title: 'Events',
          drawerLabel: 'Events',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="calendar-star" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="account" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          title: 'Users',
          drawerLabel: 'Users (Admin)',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="account-group" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          drawerLabel: 'Notifications',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="bell" size={size} iconColor={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="transactions"
        options={{
          title: 'Transaction History',
          drawerLabel: 'Transactions',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="history" size={size} iconColor={color} />
          ),
        }}
      />
    </Drawer>
  );
}
