import { apiClient } from './api/apiClient';
import type { MusicSettings, UserProfile } from '../types/user.types';

interface IUserService {
  getProfile(): Promise<UserProfile>;
  updateMusicSettings(settings: MusicSettings): Promise<void>;
}

const UserService: IUserService = {
  async getProfile() {
    const { data } = await apiClient.get<UserProfile>('/user/profile');
    return data;
  },

  async updateMusicSettings(settings: MusicSettings) {
    await apiClient.patch('/user/settings/music', settings);
  },
};

export { UserService };
