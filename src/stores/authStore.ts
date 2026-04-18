import { create } from 'zustand';

import type { AuthBootstrapSnapshot } from '@services/auth/IAuthSessionService';

interface AuthState {
  token: string | null;
  hasRegisteredAccount: boolean;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  applyBootstrap: (snapshot: AuthBootstrapSnapshot) => void;
  adoptAuthenticatedSession: (token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  hasRegisteredAccount: false,
  hydrated: false,
  setToken: (token) => set({ token }),
  applyBootstrap: (snapshot) =>
    set({
      token: snapshot.token,
      hasRegisteredAccount: snapshot.hasRegisteredAccount,
      hydrated: true,
    }),
  adoptAuthenticatedSession: (token) => set({ token, hasRegisteredAccount: true }),
  clearSession: () => set({ token: null }),
}));
