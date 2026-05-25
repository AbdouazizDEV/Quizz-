import { Alert, Linking, Platform } from 'react-native';

const SHARE_URL = 'https://quizzplus.app';

async function dataUriToFile(dataUri: string): Promise<File> {
  const res = await fetch(dataUri);
  const blob = await res.blob();
  return new File([blob], `quizz-score-${Date.now()}.png`, { type: 'image/png' });
}

async function tryWebShareFile(file: File, title: string): Promise<boolean> {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  if (!nav?.share) return false;

  const payload = { files: [file], title, text: 'Mon score sur Quizz+ !' };
  if (nav.canShare && !nav.canShare(payload)) return false;

  try {
    await nav.share(payload);
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return true;
    return false;
  }
}

function downloadDataUri(dataUri: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUri;
  anchor.download = `quizz-score-${Date.now()}.png`;
  anchor.click();
}

async function shareWithDownloadHint(dataUri: string, hint: string): Promise<void> {
  downloadDataUri(dataUri);
  if (typeof window !== 'undefined') {
    window.alert(`${hint}\n\nL’image a été téléchargée : joins-la à ton message.`);
  } else {
    Alert.alert('Partage', hint);
  }
}

export async function shareScoreImage(imageUri: string, _dialogTitle: string): Promise<void> {
  const file = await dataUriToFile(imageUri);
  const shared = await tryWebShareFile(file, 'Mon score Quizz+');
  if (!shared) {
    downloadDataUri(imageUri);
    Alert.alert('Partage', 'Image téléchargée. Tu peux la joindre manuellement à ton message.');
  }
}

export async function shareImageViaWhatsApp(imageUri: string): Promise<void> {
  const file = await dataUriToFile(imageUri);
  if (await tryWebShareFile(file, 'Quizz+ — WhatsApp')) return;

  const isMobile =
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|Android/i.test(navigator.userAgent);

  if (isMobile) {
    await shareWithDownloadHint(
      imageUri,
      'Ouvre WhatsApp et joins l’image depuis ta galerie / fichiers récents.',
    );
    const text = encodeURIComponent('Mon score sur Quizz+ !');
    await Linking.openURL(`https://wa.me/?text=${text}`);
    return;
  }

  await shareWithDownloadHint(imageUri, 'Ouvre WhatsApp Web et joins l’image téléchargée.');
  await Linking.openURL('https://web.whatsapp.com/');
}

export async function shareImageViaFacebook(imageUri: string): Promise<void> {
  const file = await dataUriToFile(imageUri);
  if (await tryWebShareFile(file, 'Quizz+ — Facebook')) return;

  downloadDataUri(imageUri);
  const params = new URLSearchParams({ u: SHARE_URL });
  await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?${params.toString()}`);
  Alert.alert('Facebook', 'L’image est téléchargée : publie-la dans un post ou une story.');
}

export async function shareImageViaSystemSheet(imageUri: string): Promise<void> {
  await shareScoreImage(imageUri, 'Partager mon score');
}
