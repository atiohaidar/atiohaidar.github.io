import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginRequest } from '@/types/api';

const SAVED_ACCOUNTS_KEY = 'savedLoginAccounts';

export function useSavedAccounts() {
  const [accounts, setAccounts] = useState<LoginRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const stored = await AsyncStorage.getItem(SAVED_ACCOUNTS_KEY);
        if (stored) {
          const parsed: LoginRequest[] = JSON.parse(stored);
          setAccounts(parsed);
        }
      } catch (error) {
        console.error('Failed to load saved accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const persistAccounts = useCallback(async (next: LoginRequest[]) => {
    try {
      setAccounts(next);
      await AsyncStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Failed to persist saved accounts:', error);
    }
  }, []);

  const upsertAccount = useCallback(
    async (account: LoginRequest) => {
      const filtered = accounts.filter((item) => item.username !== account.username);
      await persistAccounts([{ username: account.username, password: account.password }, ...filtered]);
    },
    [accounts, persistAccounts]
  );

  const removeAccount = useCallback(
    async (username: string) => {
      const filtered = accounts.filter((item) => item.username !== username);
      await persistAccounts(filtered);
    },
    [accounts, persistAccounts]
  );

  const reload = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (stored) {
        const parsed: LoginRequest[] = JSON.parse(stored);
        setAccounts(parsed);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to reload saved accounts:', error);
    }
  }, []);

  return {
    accounts,
    loading,
    upsertAccount,
    removeAccount,
    reload,
  };
}

export type UseSavedAccountsResult = ReturnType<typeof useSavedAccounts>;
