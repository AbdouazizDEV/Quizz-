import { signOutAndSyncStore } from './auth/authSessionController';

interface IAuthService {
  signOut(): Promise<void>;
}

const AuthService: IAuthService = {
  async signOut() {
    await signOutAndSyncStore();
  },
};

export { AuthService };
