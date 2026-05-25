import { create } from 'zustand';

import type { AuthMeResponse } from '@sdk';

interface AuthMeState {
  data: AuthMeResponse | null;
  loading: boolean;
  error: Error | null;
  setData: (data: AuthMeResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clear: () => void;
}

export const useAuthMeStore = create<AuthMeState>((set) => ({
  data: null,
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clear: () => set({ data: null, loading: false, error: null }),
}));
