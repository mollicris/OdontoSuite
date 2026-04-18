import { createRoute, redirect } from '@tanstack/react-router';
import type { RootRoute } from '@tanstack/react-router';
import { Login } from '../login/Login';
import { AUTH_ROUTES } from './metadata';

function RegisterPlaceholder() {
  return <div>Register coming soon</div>;
}

export function createAuthRoutes(rootRoute: RootRoute) {
  // Index route at "/" that redirects to login
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/auth/login' as any });
    },
  });

  const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: AUTH_ROUTES.ROOT,
  });

  const loginRoute = createRoute({
    getParentRoute: () => authRoute,
    path: 'login',
    component: Login,
  });

  const registerRoute = createRoute({
    getParentRoute: () => authRoute,
    path: 'register',
    component: RegisterPlaceholder,
  });

  return [
    indexRoute,
    authRoute.addChildren([loginRoute, registerRoute]),
  ];
}
