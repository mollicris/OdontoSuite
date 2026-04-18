import { createAuthRoutes } from './routes.tsx';
import type { RootRoute } from '@tanstack/react-router';

export function authRouter(rootRoute: RootRoute<any>) {
  return createAuthRoutes(rootRoute as any);
}
