import { apiClient } from '@services/api/apiClient';
import { invalidateAuthMeCache } from '@services/auth/authMeRepository';
import { useAuthStore } from '@stores/authStore';
import { extractApiError } from '@utils/extractApiError';

const UPLOAD_FALLBACK = "Impossible de mettre à jour l'avatar. Réessayez avec une photo plus légère.";

export async function uploadMyAvatar(imageBase64: string): Promise<string> {
  const token = useAuthStore.getState().token?.trim();
  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }

  const payload = imageBase64.trim();
  if (payload.length < 40) {
    throw new Error('Image trop petite ou illisible. Choisissez une autre photo.');
  }

  try {
    const { data } = await apiClient.post<{ avatar_url?: string }>(
      '/users/me/avatar',
      { image_base64: payload },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60_000,
      },
    );
    const avatar = data.avatar_url?.trim();
    if (!avatar) {
      throw new Error("L'URL d'avatar est absente après upload.");
    }
    await invalidateAuthMeCache();
    return avatar;
  } catch (error) {
    throw new Error(extractApiError(error, UPLOAD_FALLBACK));
  }
}
