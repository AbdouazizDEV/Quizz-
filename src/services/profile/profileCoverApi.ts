import { apiClient } from '@services/api/apiClient';
import { invalidateAuthMeCache } from '@services/auth/authMeRepository';
import { useAuthStore } from '@stores/authStore';
import { extractApiError } from '@utils/extractApiError';

const UPLOAD_FALLBACK = 'Impossible de mettre à jour la couverture. Réessayez avec une photo plus légère.';

export async function uploadMyCover(imageBase64: string): Promise<string> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }

  const payload = imageBase64.trim();
  if (payload.length < 40) {
    throw new Error('Image trop petite ou illisible. Choisissez une autre photo.');
  }

  try {
    const { data } = await apiClient.post<{ cover_url?: string }>(
      '/users/me/cover',
      { image_base64: payload },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60_000,
      },
    );
    const cover = data.cover_url?.trim();
    if (!cover) {
      throw new Error("L'URL de couverture est absente après upload.");
    }
    await invalidateAuthMeCache();
    return cover;
  } catch (error) {
    throw new Error(extractApiError(error, UPLOAD_FALLBACK));
  }
}
