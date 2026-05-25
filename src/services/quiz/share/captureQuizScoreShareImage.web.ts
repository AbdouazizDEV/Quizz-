import type { RefObject } from 'react';
import type { View } from 'react-native';
import html2canvas from 'html2canvas';

import { QUIZ_SHARE_CAPTURE_ID } from '@services/quiz/share/quizShareCaptureConstants';

function resolveDomNode(ref: RefObject<View | null>): HTMLElement {
  if (typeof document !== 'undefined') {
    const byId = document.getElementById(QUIZ_SHARE_CAPTURE_ID);
    if (byId) return byId;
  }

  const node = ref.current;
  if (!node) throw new Error('Carte de partage non prête.');

  const el = node as unknown as HTMLElement;
  if (el?.nodeType === 1) return el;

  // react-native-web : parfois le nœud est dans un enfant
  const child = (el as unknown as { firstElementChild?: HTMLElement })?.firstElementChild;
  if (child?.nodeType === 1) return child;

  throw new Error('Élément de capture introuvable sur le web.');
}

export async function captureQuizScoreShareImage(cardRef: RefObject<View | null>): Promise<string> {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const domNode = resolveDomNode(cardRef);
  const canvas = await html2canvas(domNode, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFB703',
    logging: false,
  });

  return canvas.toDataURL('image/png');
}
