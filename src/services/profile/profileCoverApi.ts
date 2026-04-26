import { apiClient } from '@services/api/apiClient';
import { useAuthStore } from '@stores/authStore';

export async function uploadMyCover(imageBase64: string): Promise<string> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }
  const { data } = await apiClient.post<{ cover_url?: string }>(
    '/users/me/cover',
    { image_base64: imageBase64 },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const cover = data.cover_url?.trim();
  if (!cover) {
    throw new Error("L'URL de couverture est absente après upload.");
  }
  return cover;
}

