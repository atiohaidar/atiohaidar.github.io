import React from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Text, useTheme, Appbar, FAB } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AuthenticatedSidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  showFAB?: boolean;
  fabIcon?: string;
  fabLabel?: string;
  onFABPress?: () => void;
}

export default function AuthenticatedSidebarLayout({ 
  children, 
  title, 
  showFAB = false,
  fabIcon = 'plus',
  fabLabel = 'Add',
  onFABPress
}: AuthenticatedSidebarLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  const menuItems = [
    { 
      label: 'Home', 
      icon: 'home', 
      route: '/(tabs)',
      active: pathname === '/(tabs)' || pathname === '/(tabs)/'
    },
    { 
      label: 'Tasks', 
      icon: 'check-circle', 
      route: '/(tabs)/tasks',
      active: pathname.includes('/tasks')
    },
    { 
      label: 'Articles', 
      icon: 'newspaper', 
      route: '/(tabs)/articles',
      active: pathname.includes('/articles')
    },
    { 
      label: 'Bookings', 
      icon: 'calendar', 
      route: '/(tabs)/bookings',
      active: pathname.includes('/bookings')
    },
    { 
      label: 'Chat', 
      icon: 'chat', 
      route: '/(tabs)/chat',
      active: pathname.includes('/chat')
    },
    { 
      label: 'Profile', 
      icon: 'account', 
      route: '/(tabs)/profile',
      active: pathname.includes('/profile')
    },
  ];

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* AppBar / Navbar */}
      <Appbar.Header elevated>
        <Appbar.Action icon="menu" onPress={toggleSidebar} />
        <Appbar.Content title={title} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

      <View style={styles.contentContainer}>
        {/* Sidebar */}
        {sidebarVisible && (
          <View 
            style={[
              styles.sidebar, 
              { 
                backgroundColor: theme.colors.elevation.level1,
                borderRightColor: theme.colors.outline,
              }
            ]}
          >
            <ScrollView>
              <View style={styles.sidebarHeader}>
                <Text variant="titleMedium" style={styles.sidebarTitle}>
                  Navigation
                </Text>
              </View>
              {menuItems.map((item) => (
                <Pressable
                  key={item.route}
                  accessibilityRole="button"
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => [
                    styles.drawerItem,
                    {
                      backgroundColor: item.active
                        ? theme.colors.secondaryContainer
                        : 'transparent',
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={item.active
                      ? theme.colors.onSecondaryContainer
                      : theme.colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.drawerItemLabel,
                      {
                        color: item.active
                          ? theme.colors.onSecondaryContainer
                          : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {children}
          
          {/* Floating Action Button */}
          {showFAB && onFABPress && (
            <FAB
              icon={fabIcon}
              label={fabLabel}
              style={styles.fab}
              onPress={onFABPress}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
    ...Platform.select({
      web: {
        position: 'sticky' as const,
        top: 0,
      } as any,
    }),
  },
  sidebarHeader: {
    padding: 16,
    paddingTop: 24,
  },
  sidebarTitle: {
    fontWeight: 'bold',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    gap: 12,
  },
  drawerItemLabel: {
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
