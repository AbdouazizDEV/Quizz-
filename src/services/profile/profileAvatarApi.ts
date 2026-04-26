import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

export async function uploadMyAvatar(imageBase64: string): Promise<string> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }
  const { data } = await apiClient.post<{ avatar_url?: string }>('/users/me/avatar', { image_base64: imageBase64 }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const avatar = data.avatar_url?.trim();
  if (!avatar) {
    throw new Error("L'URL d'avatar est absente après upload.");
  }
  return avatar;
}

