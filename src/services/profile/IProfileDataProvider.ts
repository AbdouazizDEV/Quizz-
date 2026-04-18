import type { ProfileScreenData } from '@app-types/profile.types';

/** Contrat pour charger les données affichées sur l’écran profil (SOLID: dépendre de l’abstraction). */
export interface IProfileDataProvider {
  getProfileScreenData(userId?: string): Promise<ProfileScreenData>;
}
