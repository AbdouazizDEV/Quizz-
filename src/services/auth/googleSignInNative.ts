import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { getGoogleClientId, isGoogleSignInConfigured } from '@config';

let configured = false;

export function configureGoogleSignIn(): void {
  if (configured || !isGoogleSignInConfigured()) return;
  GoogleSignin.configure({
    webClientId: getGoogleClientId(),
    offlineAccess: false,
  });
  configured = true;
}

export async function requestGoogleIdToken(): Promise<string> {
  if (!isGoogleSignInConfigured()) {
    throw new Error('Connexion Google indisponible. Configurez EXPO_PUBLIC_GOOGLE_CLIENT_ID.');
  }

  configureGoogleSignIn();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken?.trim();
    if (!idToken) {
      throw new Error('Connexion Google incomplète.');
    }
    return idToken;
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new Error('Connexion Google annulée.');
        case statusCodes.IN_PROGRESS:
          throw new Error('Connexion Google déjà en cours.');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Google Play Services indisponible sur cet appareil.');
        default:
          break;
      }
    }
    throw error;
  }
}
