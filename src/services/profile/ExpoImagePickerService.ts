import * as ImagePicker from 'expo-image-picker';

import type { ICoverPhotoPickerService } from './ICoverPhotoPickerService';

export class ExpoImagePickerService implements ICoverPhotoPickerService {
  async openPicker(): Promise<
    | { cancelled: true }
    | { cancelled: false; uri: string; base64?: string; mimeType?: string | null }
  > {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Permission d'accès à la galerie refusée.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
      base64: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.length) return { cancelled: true };

    const asset = result.assets[0];
    return {
      cancelled: false,
      uri: asset.uri,
      base64: asset.base64 ?? undefined,
      mimeType: asset.mimeType ?? null,
    };
  }
}

