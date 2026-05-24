import { create } from 'zustand';

interface NetworkStoreState {
  isOnline: boolean;
  ready: boolean;
  pendingSyncCount: number;
  setOnline: (online: boolean) => void;
  setReady: (ready: boolean) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  isOnline: true,
  ready: false,
  pendingSyncCount: 0,
  setOnline: (online) => set({ isOnline: online }),
  setReady: (ready) => set({ ready }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
}));
