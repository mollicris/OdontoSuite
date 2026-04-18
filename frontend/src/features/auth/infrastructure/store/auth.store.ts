import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthState } from '../../domain/Auth.types';

interface AuthStore extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: AuthUser) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: AuthUser) => {
        set({ user });
      },
    }),
    {
      name: 'auth-store',
    },
  ),
);
