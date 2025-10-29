import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PublicLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        drawerPosition: 'left',
      }}>
      <Drawer.Screen
        name="articles"
        options={{
          title: 'Articles',
          drawerLabel: 'Articles',
          drawerIcon: ({ color, size }) => (
            <IconButton icon="newspaper" size={size} iconColor={color} />
          ),
          headerRight: () => (
            <IconButton
              icon="login"
              size={24}
              onPress={() => router.push('/(auth)/login')}
            />
          ),
        }}
      />
    </Drawer>
  );
}
