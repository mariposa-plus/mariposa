import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      sendOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/login', { email });
          set({ isLoading: false });
        } catch (err: any) {
          const error = err.response?.data?.message || 'Failed to send OTP';
          set({ isLoading: false, error });
          throw new Error(error);
        }
      },

      verifyOTP: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/verify', { email, code });
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          const error = err.response?.data?.message || 'Invalid OTP';
          set({ isLoading: false, error });
          throw new Error(error);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      fetchUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
