import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { lightTheme, darkTheme } from '@/constants/paperTheme';
import { queryClient } from '@/services/queryClient';
import GlobalFeedback from '@/components/GlobalFeedback';

export const unstable_settings = {
  anchor: '(public)',
};

import { LinearGradient } from 'expo-linear-gradient';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === '(public)';

    if (!isAuthenticated && !inAuthGroup && !inPublicGroup) {
      // Redirect to public articles by default if not authenticated
      router.replace('/(public)/articles');
    } else if (isAuthenticated && (inAuthGroup || inPublicGroup)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments, router]);

  // Global Background Gradient Colors
  const gradientColors = colorScheme === 'dark'
    ? ['#0f172a', '#172554', '#0f172a'] as const // deep-navy -> blue-950 -> deep-navy
    : ['#F5F5F5', '#E0F2FE', '#F5F5F5'] as const; // Light Gray -> Light Blue -> Light Gray

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>
        <LinearGradient
          colors={gradientColors}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="(public)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </LinearGradient>
        <StatusBar style="auto" />
        <GlobalFeedback />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
