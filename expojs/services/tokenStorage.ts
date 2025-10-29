import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'authToken';

async function migrateLegacyToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const legacyToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (!legacyToken) {
    return null;
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, legacyToken);
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  return legacyToken;
}

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  const secureToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (secureToken) {
    return secureToken;
  }

  return migrateLegacyToken();
}

async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export const tokenStorage = {
  get: getToken,
  set: setToken,
  delete: deleteToken,
};
