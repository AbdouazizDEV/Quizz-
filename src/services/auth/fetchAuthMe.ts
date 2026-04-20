import type { AuthMeResponse } from '@sdk';
import { getQuizzApiClient } from '@sdk';
import { useAuthStore } from '@stores/authStore';

export type { AuthMeResponse };

export async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const token = useAuthStore.getState().token;
  if (!token?.trim()) return null;
  const { data, error } = await getQuizzApiClient().GET('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error || !data) return null;
  return data;
}
