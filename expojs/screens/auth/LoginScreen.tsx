import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, Card, useTheme, HelperText, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginRequest } from '@/types/api';
import { useSavedAccounts } from '@/hooks/useSavedAccounts';
import { LoginFields } from './components/LoginFields';
import { DemoCredentials } from './components/DemoCredentials';
import { SavedAccountsList } from './components/SavedAccountsList';

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
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(credentials);
      await saveAccountIfNeeded(credentials, Boolean(override));
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
      >
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                Welcome Back
              </Text>
              <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                Sign in to continue
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
                  />
                  <Text variant="bodyMedium" style={styles.rememberLabel}>
                    Remember this login
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
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <DemoCredentials themeColor={theme.colors.onSurfaceVariant} />

                <SavedAccountsList
                  accounts={savedAccounts}
                  loading={loading}
                  onLogin={handleQuickLogin}
                  onRemove={handleRemoveAccount}
                />
              </View>
            </Card.Content>
          </Card>
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
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    marginTop: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rememberLabel: {
    marginLeft: 4,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  error: {
    marginBottom: 8,
  },
});
