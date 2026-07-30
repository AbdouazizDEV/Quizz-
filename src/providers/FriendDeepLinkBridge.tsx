import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { Routes } from '@constants/Routes';
import { extractFriendInviteToken, isFriendInviteUrl } from '@utils/friendQrPayload';

function pushFriendInvite(router: ReturnType<typeof useRouter>, url: string): void {
  if (!isFriendInviteUrl(url)) return;
  const token = extractFriendInviteToken(url);
  if (!token) return;
  router.push(`${Routes.FRIEND_INVITE}?d=${encodeURIComponent(token)}` as never);
}

/**
 * Complète expo-router pour les liens HTTPS (App Links) et les ouvertures à chaud.
 * Le scheme `quizzplus://friend` est déjà routé vers `app/friend/` au cold start.
 */
export function FriendDeepLinkBridge() {
  const router = useRouter();

  useEffect(() => {
    const onUrl = (url: string) => pushFriendInvite(router, url);

    void Linking.getInitialURL().then((url) => {
      if (url?.startsWith('https://')) onUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => onUrl(url));
    return () => subscription.remove();
  }, [router]);

  return null;
}
