import { Router } from '@tanstack/react-router';
import { rootRoute } from './baseRedirectRouter';
import { authRouter } from '../../features/auth/router/router';
import { backofficeRouter } from '../../features/backoffice/router/router';

// Create auth and backoffice routes, then combine them
const authRoutes = authRouter(rootRoute);
const backofficeRoutes = backofficeRouter(rootRoute);
const routeTree = rootRoute.addChildren([...authRoutes, ...backofficeRoutes]);

// Create and export router instance (Singleton)
export const router = new Router({
  routeTree,
  defaultPreloadDelay: 50,
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
