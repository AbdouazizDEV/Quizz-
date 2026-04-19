import { fetchAuthMe } from '@services/auth/fetchAuthMe';
import { useAuthStore } from '@stores/authStore';

import type { IProfileDataProvider } from './IProfileDataProvider';
import { mapAuthMeToProfileScreenData } from './mapAuthMeToProfileScreenData';
import { MockProfileDataProvider } from './MockProfileDataProvider';

export class ApiProfileDataProvider implements IProfileDataProvider {
  private readonly fallback = new MockProfileDataProvider();

  async getProfileScreenData(_userId?: string) {
    const token = useAuthStore.getState().token?.trim();
    if (!token) {
      return this.fallback.getProfileScreenData(_userId);
    }
    try {
      const me = await fetchAuthMe();
      if (!me?.user) {
        return this.fallback.getProfileScreenData(_userId);
      }
      return mapAuthMeToProfileScreenData(me);
    } catch {
      return this.fallback.getProfileScreenData(_userId);
    }
  }
}
