import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, useTheme, Drawer, Appbar } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function SidebarLayout({ children, title }: SidebarLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  const menuItems = [
    { 
      label: 'Articles', 
      icon: 'newspaper', 
      route: '/(public)/articles',
      active: pathname.includes('/articles')
    },
    { 
      label: 'Login', 
      icon: 'login', 
      route: '/(auth)/login',
      active: pathname.includes('/login')
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
        <Appbar.Action 
          icon={theme.dark ? 'white-balance-sunny' : 'moon-waning-crescent'} 
          onPress={() => {
            // Theme toggle would go here if we add manual theme switching
          }}
        />
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
                <Drawer.Item
                  key={item.route}
                  label={item.label}
                  icon={item.icon}
                  active={item.active}
                  onPress={() => router.push(item.route as any)}
                  style={styles.drawerItem}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {children}
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
    marginHorizontal: 8,
    marginVertical: 2,
  },
  mainContent: {
    flex: 1,
  },
});
