import { createBackofficeRoutes } from './routes';
import type { RootRoute } from '@tanstack/react-router';

export function backofficeRouter(rootRoute: RootRoute<any>) {
  return createBackofficeRoutes(rootRoute as any);
}
