import { apiClient } from '@services/api/apiClient';
import { AxiosError } from 'axios';

import type { ILoginGateway, LoginCredentials } from './ILoginGateway';

export class ApiLoginGateway implements ILoginGateway {
  async signIn(credentials: LoginCredentials): Promise<{ accessToken: string }> {
    let data: { session: { access_token: string } | null };
    try {
      const response = await apiClient.post<{
        session: { access_token: string } | null;
      }>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      data = response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      const message =
        axiosError.response?.data?.error ??
        (axiosError.response?.status === 401
          ? 'Email ou mot de passe incorrect.'
          : 'Impossible de se connecter pour le moment.');
      throw new Error(message);
    }

    const token = data.session?.access_token;
    if (!token) {
      throw new Error('Session absente.');
    }
    return { accessToken: token };
  }
}

