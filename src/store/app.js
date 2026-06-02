import { create } from 'zustand';

// Phase 2: UI 전역 상태만 보관
// Phase 4에서 user, syncStatus 등 추가 예정

export const useAppStore = create((set) => ({
  // 인증 (Phase 4)
  user: null,
  setUser: (user) => set({ user }),

  // 동기화 상태 (Phase 4)
  syncStatus: 'local', // 'local' | 'syncing' | 'synced' | 'error'
  setSyncStatus: (status) => set({ syncStatus: status }),
}));
