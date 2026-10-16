import type { ReactNode } from 'react';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';

/** Charge Nunito une seule fois pour toute l’app (titres ExtraBold, corps SemiBold, mentions Regular). */
export function AppFonts({ children }: { children: ReactNode }) {
  useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  return children;
}
