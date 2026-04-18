import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AUTH_STORAGE_KEYS } from '@constants/authStorageKeys';

/** Lecture / écriture du jeton de session (SecureStore sur mobile, AsyncStorage sur le web). */
export interface IAuthTokenPersistence {
  readToken(): Promise<string | null>;
  writeToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}

/** Indique si l’utilisateur a déjà créé un compte sur cet appareil (splash → login si déconnecté). */
export interface IAccountRegistrationPersistence {
  readHasRegisteredAccount(): Promise<boolean>;
  writeHasRegisteredAccount(value: boolean): Promise<void>;
}

export class ExpoAuthTokenPersistence implements IAuthTokenPersistence {
  async readToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(AUTH_STORAGE_KEYS.sessionToken);
    }
    return SecureStore.getItemAsync(AUTH_STORAGE_KEYS.sessionToken);
  }

  async writeToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.sessionToken, token);
      return;
    }
    await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.sessionToken, token);
  }

  async clearToken(): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.sessionToken);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.sessionToken);
    } catch {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.sessionToken);
    }
  }
}

export class AsyncStorageAccountRegistrationPersistence implements IAccountRegistrationPersistence {
  async readHasRegisteredAccount(): Promise<boolean> {
    const v = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.hasRegisteredAccount);
    return v === '1';
  }

  async writeHasRegisteredAccount(value: boolean): Promise<void> {
    if (value) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.hasRegisteredAccount, '1');
    } else {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.hasRegisteredAccount);
    }
  }
}
