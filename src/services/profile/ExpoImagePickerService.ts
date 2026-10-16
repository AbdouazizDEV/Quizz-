import * as ImagePicker from 'expo-image-picker';

import type { ICoverPhotoPickerService } from './ICoverPhotoPickerService';

export type ProfileImagePickerOptions = {
  aspect?: [number, number];
  quality?: number;
};

export class ExpoImagePickerService implements ICoverPhotoPickerService {
  async openPicker(options?: ProfileImagePickerOptions): Promise<
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
      quality: options?.quality ?? 0.45,
      base64: true,
      aspect: options?.aspect ?? [16, 9],
      exif: false,
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

  openAvatarPicker(): ReturnType<ExpoImagePickerService['openPicker']> {
    return this.openPicker({ aspect: [1, 1], quality: 0.4 });
  }
}
