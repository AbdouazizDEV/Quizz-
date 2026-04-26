import type { ICoverPhotoPickerService } from './ICoverPhotoPickerService';

/** Placeholder jusqu’à intégration d’un sélecteur d’images réel. */
export class StubCoverPhotoPickerService implements ICoverPhotoPickerService {
  async openPicker(): Promise<
    | { cancelled: true }
    | { cancelled: false; uri: string; base64?: string; mimeType?: string | null }
  > {
    return { cancelled: true };
  }
}
