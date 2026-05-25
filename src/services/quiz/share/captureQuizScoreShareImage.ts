import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export async function captureQuizScoreShareImage(cardRef: RefObject<View | null>): Promise<string> {
  const node = cardRef.current;
  if (!node) throw new Error('Carte de partage non prête.');

  return captureRef(node, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
}
