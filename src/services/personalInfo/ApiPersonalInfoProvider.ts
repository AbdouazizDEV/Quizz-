import type { AuthMeResponse } from '@sdk';
import { apiClient } from '@services/api/apiClient';
import { getCachedAuthMe, invalidateAuthMeCache, setAuthMeCache } from '@services/auth/authMeRepository';
import { loadAuthMe } from '@services/auth/authMeRepository';
import { useAuthStore } from '@stores/authStore';
import type { PersonalInfoFormValues, PersonalInfoUpdatePayload } from '@app-types/personalInfo.types';

import type { IPersonalInfoPort } from './IPersonalInfoPort';
import { mapAuthMeToPersonalInfoForm } from './personalInfoMapper';

function authHeaders(): { Authorization: string } {
  const token = useAuthStore.getState().token?.trim();
  if (!token) throw new Error('Utilisateur non connecté.');
  return { Authorization: `Bearer ${token}` };
}

export class ApiPersonalInfoProvider implements IPersonalInfoPort {
  async load(): Promise<PersonalInfoFormValues> {
    const cached = (await getCachedAuthMe()) ?? (await loadAuthMe({ force: false }));
    if (!cached?.user) throw new Error('Profil introuvable.');
    return mapAuthMeToPersonalInfoForm(cached);
  }

  async save(patch: PersonalInfoUpdatePayload): Promise<PersonalInfoFormValues> {
    const { data } = await apiClient.patch<{ user?: AuthMeResponse['user']; profile?: AuthMeResponse['profile'] }>(
      '/users/me/personal-info',
      patch,
      { headers: authHeaders() },
    );

    if (data.user) {
      const merged: AuthMeResponse = {
        user: data.user,
        profile: data.profile ?? null,
      };
      await setAuthMeCache(merged);
      return mapAuthMeToPersonalInfoForm(merged);
    }

    await invalidateAuthMeCache();
    return this.load();
  }
}
