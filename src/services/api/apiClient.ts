import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '../../../config';

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

      ApiClient.instance.interceptors.request.use((config) => {
        return config;
      });

      ApiClient.instance.interceptors.response.use(
        (response) => response,
        (error) => {
          if (AppConfig.ENABLE_LOGS) {
            console.error('[API Error]', error.response?.status, error.config?.url);
          }
          return Promise.reject(error);
        },
      );
    }

    return ApiClient.instance;
  }
}

export const apiClient = ApiClient.getInstance();
