import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

/**
 * True si l’appareil peut stocker une passkey locale (verrouillage écran / biométrie).
 * Sans verrouillage → fallback email + mot de passe.
 */
export async function canUseLocalPasskey(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    // NONE = 0 : pas de PIN / schéma / biométrie.
    return level > LocalAuthentication.SecurityLevel.NONE;
  } catch {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled === true;
    } catch {
      return false;
    }
  }
}
