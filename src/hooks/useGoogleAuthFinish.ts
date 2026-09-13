import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { Routes } from '@constants/Routes';
import {
  persistPasskeyAuthResult,
  signOutAndSyncStore,
} from '@services/auth/authSessionController';
import { getAuthMeFromStore } from '@services/auth/authMeRepository';
import {
  isGoogleAccountNotRegisteredError,
  loginWithGoogleIdToken,
  toFrenchGoogleAuthError,
} from '@services/auth/googleAuthService';
import { requestGoogleIdToken } from '@services/auth/googleSignInNative';
import { mapLoginUserToAuthMe } from '@services/auth/mapLoginToAuthMe';

export function useGoogleAuthFinish() {
  const router = useRouter();
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const finishGoogleSignIn = useCallback(
    async (idToken: string) => {
      const { user, session } = await loginWithGoogleIdToken(idToken);
      await persistPasskeyAuthResult(session, mapLoginUserToAuthMe(user));
      if (!getAuthMeFromStore()) {
        await signOutAndSyncStore();
        throw new Error('Profil introuvable après connexion Google.');
      }
      router.replace(Routes.HOME);
    },
    [router],
  );

  const signInWithGoogle = useCallback(async () => {
    if (googleSubmitting) return;
    setGoogleError(null);
    setShowRegisterPrompt(false);
    setGoogleSubmitting(true);
    try {
      const idToken = await requestGoogleIdToken();
      await finishGoogleSignIn(idToken);
    } catch (error) {
      setShowRegisterPrompt(isGoogleAccountNotRegisteredError(error));
      setGoogleError(toFrenchGoogleAuthError(error));
    } finally {
      setGoogleSubmitting(false);
    }
  }, [finishGoogleSignIn, googleSubmitting]);

  const clearGoogleError = useCallback(() => {
    setGoogleError(null);
    setShowRegisterPrompt(false);
  }, []);

  return {
    signInWithGoogle,
    googleSubmitting,
    googleError,
    showRegisterPrompt,
    clearGoogleError,
  };
}
