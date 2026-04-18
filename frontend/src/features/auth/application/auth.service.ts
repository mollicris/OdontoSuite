import { loginUser, registerUser } from '../infrastructure/api/auth.api';
import { useAuthStore } from '../infrastructure/store/auth.store';
import type { LoginRequest, RegisterRequest } from '../domain/Auth.request';
import type { AuthUser } from '../domain/Auth.types';

export const authService = {
  async login(req: LoginRequest): Promise<AuthUser> {
    const { token, user } = await loginUser(req);
    useAuthStore.getState().login(token, user);
    return user;
  },

  async register(req: RegisterRequest): Promise<AuthUser> {
    const user = await registerUser(req);
    return user;
  },

  logout(): void {
    useAuthStore.getState().logout();
  },

  getUser(): AuthUser | null {
    return useAuthStore.getState().user;
  },

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  },
};
