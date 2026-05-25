import * as Sharing from 'expo-sharing';
import { Alert, Platform, Share } from 'react-native';

async function ensureSharingAvailable(): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Le partage de fichiers n’est pas disponible sur cet appareil.');
  }
}

/** Partage l’image (menu système : WhatsApp, Facebook, Instagram, etc.). */
export async function shareScoreImage(imageUri: string, dialogTitle: string): Promise<void> {
  if (Platform.OS === 'web') return;

  await ensureSharingAvailable();
  await Sharing.shareAsync(imageUri, {
    mimeType: 'image/png',
    dialogTitle,
    UTI: 'public.png',
  });
}

export async function shareImageViaWhatsApp(imageUri: string): Promise<void> {
  await shareScoreImage(imageUri, 'Partager sur WhatsApp');
}

export async function shareImageViaFacebook(imageUri: string): Promise<void> {
  await shareScoreImage(imageUri, 'Partager sur Facebook');
}

export async function shareImageViaSystemSheet(imageUri: string): Promise<void> {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      await Share.share({
        url: imageUri,
        message: 'Mon score sur Quizz+ !',
        title: 'Mon score Quizz+',
      });
      return;
    } catch {
      /* fallback expo-sharing */
    }
  }
  await shareScoreImage(imageUri, 'Partager mon score');
}
