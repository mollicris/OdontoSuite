import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthState } from '../../domain/Auth.types';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'authUser';

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
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: AuthUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        set({ user });
      },
    }),
    {
      name: 'auth-store',
      storage: {
        getItem: (_key: string) => {
          const token = localStorage.getItem(TOKEN_KEY);
          const user = localStorage.getItem(USER_KEY);
          if (token && user) {
            return {
              token,
              user: JSON.parse(user),
              isAuthenticated: true,
            } as any;
          }
          return null;
        },
        setItem: () => {
          // Handled manually in login/logout
        },
        removeItem: () => {
          // Handled manually in logout
        },
      } as any,
    },
  ),
);
