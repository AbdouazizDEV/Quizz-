import { ExpoImagePickerService } from './ExpoImagePickerService';

import type { ICoverPhotoPickerService } from './ICoverPhotoPickerService';

let instance: ICoverPhotoPickerService = new ExpoImagePickerService();

export function getCoverPhotoPickerService(): ICoverPhotoPickerService {
  return instance;
}

export function setCoverPhotoPickerService(service: ICoverPhotoPickerService): void {
  instance = service;
}
