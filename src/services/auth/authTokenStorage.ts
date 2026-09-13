import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AUTH_STORAGE_KEYS } from '@constants/authStorageKeys';

async function readSecureOrAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function writeSecureOrAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function clearSecureOrAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

export async function readStoredRefreshToken(): Promise<string | null> {
  return readSecureOrAsync(AUTH_STORAGE_KEYS.refreshToken);
}

export async function writeStoredRefreshToken(refreshToken: string): Promise<void> {
  await writeSecureOrAsync(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
}

export async function clearStoredRefreshToken(): Promise<void> {
  await clearSecureOrAsync(AUTH_STORAGE_KEYS.refreshToken);
}

export async function readStoredSessionExpiresAt(): Promise<number | null> {
  const raw = await readSecureOrAsync(AUTH_STORAGE_KEYS.sessionExpiresAt);
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function writeStoredSessionExpiresAt(expiresAt: number): Promise<void> {
  await writeSecureOrAsync(AUTH_STORAGE_KEYS.sessionExpiresAt, String(expiresAt));
}

export async function clearStoredSessionExpiresAt(): Promise<void> {
  await clearSecureOrAsync(AUTH_STORAGE_KEYS.sessionExpiresAt);
}

export async function readStoredSessionHardExpiresAt(): Promise<number | null> {
  const raw = await readSecureOrAsync(AUTH_STORAGE_KEYS.sessionHardExpiresAt);
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function writeStoredSessionHardExpiresAt(expiresAt: number): Promise<void> {
  await writeSecureOrAsync(AUTH_STORAGE_KEYS.sessionHardExpiresAt, String(expiresAt));
}

export async function clearStoredSessionHardExpiresAt(): Promise<void> {
  await clearSecureOrAsync(AUTH_STORAGE_KEYS.sessionHardExpiresAt);
}
