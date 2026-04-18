import { MockProfileDataProvider } from './MockProfileDataProvider';

import type { IProfileDataProvider } from './IProfileDataProvider';

/** Point d’injection unique : swap pour une implémentation API sans toucher aux écrans. */
let instance: IProfileDataProvider = new MockProfileDataProvider();

export function getProfileDataProvider(): IProfileDataProvider {
  return instance;
}

export function setProfileDataProvider(provider: IProfileDataProvider): void {
  instance = provider;
}
