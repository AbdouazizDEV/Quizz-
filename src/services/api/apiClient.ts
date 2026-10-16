import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AppConfig } from '../../../config';
import {
  isAccessTokenLikelyExpired,
  refreshAuthSessionIfNeeded,
  shouldForceLogoutAfterRefreshFailure,
} from '@services/auth/refreshAuthSession';
import { readStoredSessionExpiresAt } from '@services/auth/authTokenStorage';
import { useAuthStore } from '@stores/authStore';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

class ApiClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: AppConfig.API_BASE_URL,
        timeout: AppConfig.TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      ApiClient.instance.interceptors.request.use(async (config) => {
        let token = useAuthStore.getState().token?.trim();
        if (token) {
          const storedExpiresAt = await readStoredSessionExpiresAt();
          if (isAccessTokenLikelyExpired(token, storedExpiresAt)) {
            const refreshed = await refreshAuthSessionIfNeeded({ force: true });
            if (refreshed.ok) {
              token = refreshed.accessToken;
            }
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      ApiClient.instance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const original = error.config as RetryConfig | undefined;
          const status = error.response?.status as number | undefined;

          if (status === 401 && original && !original._retry) {
            original._retry = true;
            const previousToken = useAuthStore.getState().token;
            const storedExpiresAt = await readStoredSessionExpiresAt();
            const refreshed = await refreshAuthSessionIfNeeded({ force: true });

            if (refreshed.ok) {
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${refreshed.accessToken}`;
              return ApiClient.instance(original);
            }

            if (shouldForceLogoutAfterRefreshFailure(refreshed, previousToken, storedExpiresAt)) {
              const { signOutAndSyncStore } = await import('@services/auth/authSessionController');
              await signOutAndSyncStore();
            }
          }

          if (AppConfig.ENABLE_LOGS) {
            console.error('[API Error]', status, original?.url);
          }
          return Promise.reject(error);
        },
      );
    }

    return ApiClient.instance;
  }
}

export const apiClient = ApiClient.getInstance();
