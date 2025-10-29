import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, useTheme, HelperText, Checkbox, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginRequest } from '@/types/api';

const SAVED_ACCOUNTS_KEY = 'savedLoginAccounts';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<LoginRequest[]>([]);

  const { login } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const stored = await AsyncStorage.getItem(SAVED_ACCOUNTS_KEY);
        if (stored) {
          const parsed: LoginRequest[] = JSON.parse(stored);
          setSavedAccounts(parsed);
        }
      } catch (storageError) {
        console.error('Failed to load saved accounts:', storageError);
      }
    };

    loadAccounts();
  }, []);

  const persistAccounts = async (accounts: LoginRequest[]) => {
    try {
      setSavedAccounts(accounts);
      await AsyncStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (storageError) {
      console.error('Failed to persist saved accounts:', storageError);
    }
  };

  const saveAccountIfNeeded = async (account: LoginRequest, force = false) => {
    if (!rememberMe && !force) {
      return;
    }

    const existing = savedAccounts.filter((item) => item.username !== account.username);
    await persistAccounts([{ username: account.username, password: account.password }, ...existing]);
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
    const filtered = savedAccounts.filter((account) => account.username !== accountUsername);
    await persistAccounts(filtered);
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
                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  left={<TextInput.Icon icon="account" />}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
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

                <View style={styles.infoCard}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Demo Credentials:
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Admin: admin / admin123
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    User: user / user123
                  </Text>
                </View>

                {savedAccounts.length > 0 && (
                  <View style={styles.savedAccountsContainer}>
                    <Text variant="titleSmall" style={styles.savedAccountsTitle}>
                      Quick login
                    </Text>
                    {savedAccounts.map((account) => (
                      <View key={account.username} style={styles.savedAccountRow}>
                        <Button
                          mode="outlined"
                          onPress={() => handleQuickLogin(account)}
                          disabled={loading}
                          style={styles.savedAccountButton}
                          contentStyle={styles.savedAccountContent}
                        >
                          {account.username}
                        </Button>
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleRemoveAccount(account.username)}
                          disabled={loading}
                          accessibilityLabel={`Remove ${account.username}`}
                        />
                      </View>
                    ))}
                  </View>
                )}
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
  input: {
    marginBottom: 12,
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
  infoCard: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  savedAccountsContainer: {
    marginTop: 24,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    gap: 8,
  },
  savedAccountsTitle: {
    fontWeight: '600',
  },
  savedAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedAccountButton: {
    flex: 1,
    marginRight: 8,
  },
  savedAccountContent: {
    paddingVertical: 4,
  },
});
