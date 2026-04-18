import { StubCoverPhotoPickerService } from './StubCoverPhotoPickerService';

import type { ICoverPhotoPickerService } from './ICoverPhotoPickerService';

let instance: ICoverPhotoPickerService = new StubCoverPhotoPickerService();

export function getCoverPhotoPickerService(): ICoverPhotoPickerService {
  return instance;
}

export function setCoverPhotoPickerService(service: ICoverPhotoPickerService): void {
  instance = service;
}
