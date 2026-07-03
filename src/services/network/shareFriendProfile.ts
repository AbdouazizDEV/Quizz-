import * as Clipboard from 'expo-clipboard';
import { Alert, Platform, Share } from 'react-native';

import { encodeFriendQrDeepLink, type FriendQrProfile } from '@utils/friendQrPayload';

export async function shareFriendProfile(profile: FriendQrProfile): Promise<void> {
  const link = encodeFriendQrDeepLink(profile);
  const message = `Ajoute-moi sur Quizz+ ! Scanne mon QR ou ouvre ce lien : ${link}`;

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: 'Mon profil Quizz+',
        text: message,
        url: link,
      });
      return;
    }
    await Clipboard.setStringAsync(link);
    Alert.alert('Lien copié', 'Le lien de ton profil a été copié dans le presse-papiers.');
    return;
  }

  await Share.share({
    title: 'Mon profil Quizz+',
    message,
    url: link,
  });
}
