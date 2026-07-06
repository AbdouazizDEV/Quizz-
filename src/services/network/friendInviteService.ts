import { Alert } from 'react-native';

import { getConnectionFollowService } from '@services/network/connectionFollowServiceInstance';
import {
  clearPendingFriendInvite,
  consumePendingFriendInvite,
  storePendingFriendInvite,
} from '@services/network/pendingFriendInvite';
import { useAuthMeStore } from '@stores/authMeStore';
import { useAuthStore } from '@stores/authStore';
import {
  decodeFriendQrPayload,
  extractFriendInviteToken,
  type FriendQrProfile,
} from '@utils/friendQrPayload';

export type FriendInviteSendResult =
  | { ok: true; profile: FriendQrProfile }
  | {
      ok: false;
      code: 'invalid' | 'self' | 'not_logged_in' | 'api_error';
      message: string;
    };

export function decodeFriendInviteToken(token: string): FriendQrProfile | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  return decodeFriendQrPayload(`quizzplus://friend?d=${trimmed}`);
}

export async function sendFriendInviteFromToken(
  token: string,
  myUserId?: string | null,
): Promise<FriendInviteSendResult> {
  const profile = decodeFriendInviteToken(token);
  if (!profile) {
    return { ok: false, code: 'invalid', message: 'Invitation invalide ou expirée.' };
  }

  const viewerId =
    myUserId?.trim() ?? useAuthMeStore.getState().data?.user?.id?.trim() ?? '';

  const authToken = useAuthStore.getState().token?.trim();
  if (!authToken) {
    await storePendingFriendInvite(token);
    return {
      ok: false,
      code: 'not_logged_in',
      message: 'Connecte-toi pour envoyer une demande d’ami.',
    };
  }

  if (viewerId && profile.uid === viewerId) {
    return { ok: false, code: 'self', message: 'Tu ne peux pas t’ajouter toi-même.' };
  }

  try {
    await getConnectionFollowService().setFollowing(profile.uid, true);
    await clearPendingFriendInvite();
    return { ok: true, profile };
  } catch {
    return {
      ok: false,
      code: 'api_error',
      message: 'Impossible d’envoyer la demande pour le moment.',
    };
  }
}

export async function sendFriendInviteFromRawPayload(
  rawPayload: string,
  myUserId?: string | null,
): Promise<FriendInviteSendResult> {
  const token = extractFriendInviteToken(rawPayload) ?? rawPayload.trim();
  if (!token) {
    return { ok: false, code: 'invalid', message: 'Invitation invalide ou expirée.' };
  }
  return sendFriendInviteFromToken(token, myUserId);
}

/** Traite une invitation en attente après connexion ou au démarrage. */
export async function tryProcessPendingFriendInvite(myUserId?: string | null): Promise<void> {
  if (!useAuthStore.getState().token?.trim()) return;

  const token = await consumePendingFriendInvite();
  if (!token) return;

  const result = await sendFriendInviteFromToken(token, myUserId);
  if (result.ok) {
    Alert.alert('Demande envoyée', `Ta demande d’ami a été envoyée à ${result.profile.n}.`);
    return;
  }

  if (result.code === 'self' || result.code === 'invalid') {
    Alert.alert('Invitation ami', result.message);
    return;
  }

  if (result.code === 'api_error') {
    await storePendingFriendInvite(token);
    Alert.alert('Invitation ami', result.message);
  }
}
