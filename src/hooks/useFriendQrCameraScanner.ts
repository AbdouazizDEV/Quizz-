import { useEffect, useRef, useState } from 'react';

import { decodeFriendQrPayload, isRecognizedFriendInvitePayload } from '@utils/friendQrPayload';

type ScannerStatus = 'idle' | 'starting' | 'ready' | 'error';

function resolveCameraErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Accès à la caméra refusé. Autorise la caméra dans les paramètres du navigateur, puis recharge la page.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Aucune caméra détectée sur cet appareil.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'La caméra est déjà utilisée par une autre application.';
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Impossible d’accéder à la caméra sur cet appareil.';
}

interface UseFriendQrCameraScannerOptions {
  containerId: string;
  enabled: boolean;
  onDetected: (payload: string) => void;
}

export function useFriendQrCameraScanner({
  containerId,
  enabled,
  onDetected,
}: UseFriendQrCameraScannerOptions) {
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const handledRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  useEffect(() => {
    handledRef.current = false;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    let startTimer: ReturnType<typeof setTimeout> | undefined;

    const cleanupScanner = async () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;
      try {
        await scanner.stop();
      } catch {
        /* ignore */
      }
      try {
        scanner.clear();
      } catch {
        /* ignore */
      }
    };

    const startScanner = async () => {
      setStatus('starting');
      setErrorMessage(null);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      if (cancelled) return;

      const element = document.getElementById(containerId);
      if (!element) {
        setStatus('error');
        setErrorMessage('Impossible d’initialiser l’aperçu caméra.');
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setErrorMessage('La caméra n’est pas disponible sur ce navigateur.');
        return;
      }

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        await cleanupScanner();
        if (cancelled) return;

        const scanner = new Html5Qrcode(containerId, false);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            disableFlip: false,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const edge = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.max(220, Math.floor(edge * 0.92));
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            if (cancelled || handledRef.current) return;

            const payload = decodedText.trim();
            if (!payload || !isRecognizedFriendInvitePayload(payload)) return;
            if (!decodeFriendQrPayload(payload)) return;

            handledRef.current = true;
            void cleanupScanner().finally(() => {
              onDetectedRef.current(payload);
            });
          },
          () => {},
        );

        if (cancelled) {
          await cleanupScanner();
          return;
        }

        setStatus('ready');
        setErrorMessage(null);
      } catch (error) {
        if (cancelled) return;
        await cleanupScanner();
        setStatus('error');
        setErrorMessage(resolveCameraErrorMessage(error));
      }
    };

    startTimer = setTimeout(() => {
      void startScanner();
    }, 120);

    return () => {
      cancelled = true;
      if (startTimer) clearTimeout(startTimer);
      void cleanupScanner();
    };
  }, [containerId, enabled]);

  return { status, errorMessage };
}
