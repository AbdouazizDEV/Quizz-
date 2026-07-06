import { AppConfig } from '@config';
import * as Clipboard from 'expo-clipboard';
import { Alert, Platform, Share } from 'react-native';

import {
  encodeFriendInviteWebLink,
  encodeFriendQrDeepLink,
  type FriendQrProfile,
} from '@utils/friendQrPayload';

export async function shareFriendProfile(profile: FriendQrProfile): Promise<void> {
  const webLink = encodeFriendInviteWebLink(profile, AppConfig.INVITE_WEB_BASE_URL);
  const deepLink = encodeFriendQrDeepLink(profile);
  const message = `Ajoute-moi sur Quizz+ ! Ouvre ce lien pour m’ajouter :\n${webLink}`;

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: 'Mon profil Quizz+',
        text: message,
        url: webLink,
      });
      return;
    }
    await Clipboard.setStringAsync(webLink);
    Alert.alert('Lien copié', 'Le lien de ton profil a été copié dans le presse-papiers.');
    return;
  }

  await Share.share({
    title: 'Mon profil Quizz+',
    message,
    url: Platform.OS === 'ios' ? webLink : deepLink,
  });
}
