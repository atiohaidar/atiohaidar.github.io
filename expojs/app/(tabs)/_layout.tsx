import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { TouchableOpacity } from 'react-native';
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
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="home" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ padding: 8 }}>
              <IconButton
                icon="logout"
                size={24}
                iconColor={Colors[colorScheme ?? 'light'].tint}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          drawerLabel: 'Tasks',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="checkbox-marked-circle" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="articles"
        options={{
          title: 'Articles',
          drawerLabel: 'Articles',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="newspaper" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          drawerLabel: 'Bookings',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="calendar" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="chat"
        options={{
          title: 'Chat',
          drawerLabel: 'Chat',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="chat" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="anonymous-chat"
        options={{
          title: 'Anonymous Chat',
          drawerLabel: 'Anonymous Chat',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="chat-outline" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          drawerLabel: 'Tickets',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="ticket" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="forms"
        options={{
          title: 'Forms',
          drawerLabel: 'Forms',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="form-select" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="items"
        options={{
          title: 'Items',
          drawerLabel: 'Items',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="package-variant" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="item-borrowings"
        options={{
          title: 'Borrowings',
          drawerLabel: 'Borrowings',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="clipboard-list" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="discussions"
        options={{
          title: 'Discussions',
          drawerLabel: 'Discussions',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="forum" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          title: 'Events',
          drawerLabel: 'Events',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="calendar-star" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerLabel: 'Profile',
          drawerIcon: ({ color, size }) => (
            <TouchableOpacity style={{ padding: 4 }}>
              <IconButton icon="account" size={size} iconColor={color} />
            </TouchableOpacity>
          ),
        }}
      />
    </Drawer>
  );
}
