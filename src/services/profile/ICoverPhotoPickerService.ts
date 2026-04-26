/**
 * Abstraction pour le flux « choisir une photo de couverture » (SOLID: DIP).
 * Brancher expo-image-picker ou un module natif dans une implémentation concrète.
 */
export interface ICoverPhotoPickerService {
  openPicker(): Promise<
    | { cancelled: true }
    | { cancelled: false; uri: string; base64?: string; mimeType?: string | null }
  >;
}
