import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, useTheme, HelperText, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedAccounts } from '@/hooks/useSavedAccounts';
import type { LoginRequest } from '@/types/api';
import { LoginFields } from './components/LoginFields';
import { DemoCredentials } from './components/DemoCredentials';
import { SavedAccountsList } from './components/SavedAccountsList';
import { GlassCard } from '@/components/GlassCard';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { accounts: savedAccounts, upsertAccount, removeAccount } = useSavedAccounts();

  const saveAccountIfNeeded = async (account: LoginRequest, force = false) => {
    if (!rememberMe && !force) {
      return;
    }
    await upsertAccount(account);
  };

  const handleLogin = async (override?: LoginRequest) => {
    const credentials = override ?? { username, password };
    if (!credentials.username || !credentials.password) {
      setError('Mohon isi username dan password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(credentials);
      await saveAccountIfNeeded(credentials, Boolean(override));
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Mohon periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (account: LoginRequest) => {
    if (loading) return;
    setUsername(account.username);
    setPassword(account.password);
    setRememberMe(true);
    handleLogin(account);
  };

  const handleRemoveAccount = async (accountUsername: string) => {
    await removeAccount(accountUsername);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.cardContent}>
              <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                Selamat Datang Kembali
              </Text>
              <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Masuk untuk mengelola dashboard Anda
              </Text>

              <View style={styles.form}>
                <LoginFields
                  username={username}
                  password={password}
                  onUsernameChange={setUsername}
                  onPasswordChange={setPassword}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                />

                <View style={styles.rememberRow}>
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(!rememberMe)}
                    disabled={loading}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" style={[styles.rememberLabel, { color: theme.colors.onSurface }]}>
                    Ingat saya
                  </Text>
                </View>

                {error ? (
                  <HelperText type="error" visible={!!error} style={styles.error}>
                    {error}
                  </HelperText>
                ) : null}

                <Button
                  mode="contained"
                  onPress={() => handleLogin()}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  {loading ? 'Sedang Masuk...' : 'Masuk'}
                </Button>

                <DemoCredentials themeColor={theme.colors.onSurfaceVariant} />

                <SavedAccountsList
                  accounts={savedAccounts}
                  loading={loading}
                  onLogin={handleQuickLogin}
                  onRemove={handleRemoveAccount}
                />

                {/* Navigation Links */}
                <View style={styles.linksContainer}>
                  <View style={styles.linkRow}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Belum punya akun?{' '}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{ color: '#22C55E', fontWeight: '600' }}
                      onPress={() => router.push('/register')}
                    >
                      Daftar
                    </Text>
                  </View>
                  <Text
                    variant="bodyMedium"
                    style={{ color: '#F59E0B', fontWeight: '600', marginTop: 8 }}
                    onPress={() => router.push('/forgot-password')}
                  >
                    Lupa Password?
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    width: '100%',
  },
  cardContent: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginTop: 0,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  rememberLabel: {
    marginLeft: 8,
  },
  button: {
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    marginBottom: 8,
    textAlign: 'center',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
