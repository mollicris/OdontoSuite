import { createRoute, redirect } from '@tanstack/react-router';
import type { RootRoute } from '@tanstack/react-router';
import { useAuthStore } from '../../auth/infrastructure/store/auth.store';
import { BackofficeLayout } from '../layout/BackofficeLayout';
import { Dashboard } from '../dashboard/Dashboard';
import { PatientList } from '../../patients/list/PatientList';
import { PatientDetail } from '../../patients/detail/PatientDetail';
import { AppointmentsPage } from '../../appointments/AppointmentsPage';
import { BACKOFFICE_ROUTES } from './metadata';

function PlaceholderPage({ section }: { section: string }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>{section}</h2>
      <p>Esta sección está en construcción</p>
    </div>
  );
}

const checkAuthBeforeLoad = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: '/auth/login' as any });
  }
};

export function createBackofficeRoutes(rootRoute: RootRoute) {
  const backofficeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: BACKOFFICE_ROUTES.ROOT,
    component: BackofficeLayout,
    beforeLoad: checkAuthBeforeLoad,
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'dashboard',
    component: Dashboard,
  });

  const patientsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'patients',
    component: PatientList,
  });

  const patientDetailRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'patients/$patientId',
    component: PatientDetail,
  });

  const appointmentsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'appointments',
    component: AppointmentsPage,
  });

  const treatmentsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'treatments',
    component: () => <PlaceholderPage section="Tratamientos" />,
  });

  const billingRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'billing',
    component: () => <PlaceholderPage section="Facturación" />,
  });

  const clinicRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'clinic',
    component: () => <PlaceholderPage section="Clínica" />,
  });

  const reportsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'reports',
    component: () => <PlaceholderPage section="Reportes" />,
  });

  return [
    backofficeRoute.addChildren([
      dashboardRoute,
      patientsRoute,
      patientDetailRoute,
      appointmentsRoute,
      treatmentsRoute,
      billingRoute,
      clinicRoute,
      reportsRoute,
    ]),
  ];
}
