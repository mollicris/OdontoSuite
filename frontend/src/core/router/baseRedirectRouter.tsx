import { createRootRoute, Outlet } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
    </div>
  ),
});

function RootComponent() {
  return <Outlet />;
}
