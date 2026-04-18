import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '../../features/auth/infrastructure/store/auth.store';
import { ROUTES } from '../constants/routes';

export function useAuthGuard() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
}

export function checkAuthBeforeLoad() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: ROUTES.AUTH.LOGIN });
  }
}

export function redirectToLogin() {
  if (typeof globalThis !== 'undefined' && globalThis.location) {
    globalThis.location.href = ROUTES.AUTH.LOGIN;
  }
}
