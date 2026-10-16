import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

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
import { resolvePostLoginHref } from '@utils/postLoginRedirect';

export function useGoogleAuthFinish() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const postLoginHref = resolvePostLoginHref(returnTo);
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
      router.replace(postLoginHref);
    },
    [postLoginHref, router],
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
