import { createRoute, redirect } from '@tanstack/react-router';
import type { RootRoute } from '@tanstack/react-router';
import { useAuthStore } from '../../auth/infrastructure/store/auth.store';
import { UserRole } from '../../auth/domain/roles';
import { BackofficeLayout } from '../layout/BackofficeLayout';
import { DashboardPage } from '../dashboard/DashboardPage';
import { PatientList } from '../../patients/list/PatientList';
import { PatientDetail } from '../../patients/detail/PatientDetail';
import { AppointmentsPage } from '../../appointments/AppointmentsPage';
import { TreatmentsPage } from '../../treatments/presentation/TreatmentsPage';
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
  const stored = typeof window !== 'undefined' ? localStorage.getItem('auth-store') : null;
  const hasToken = stored ? JSON.parse(stored).state?.token : false;

  if (!isAuthenticated && !hasToken) {
    throw redirect({ to: '/auth/login' as any });
  }
};

const checkRoleBeforeLoad = (allowedRoles: UserRole[]) => () => {
  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: '/auth/login' as any });
  }
  const role = user?.role as UserRole | undefined;
  if (!role || !allowedRoles.includes(role)) {
    throw redirect({ to: BACKOFFICE_ROUTES.DASHBOARD as any });
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
    component: DashboardPage,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY, UserRole.PATIENT]),
  });

  const patientsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'patients',
    component: PatientList,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY]),
  });

  const patientDetailRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'patients/$patientId',
    component: PatientDetail,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY]),
  });

  const appointmentsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'appointments',
    component: AppointmentsPage,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY, UserRole.PATIENT]),
  });

  const treatmentsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'treatments',
    component: TreatmentsPage,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN, UserRole.DENTIST]),
  });

  const billingRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'billing',
    component: () => <PlaceholderPage section="Facturación" />,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN, UserRole.SECRETARY]),
  });

  const clinicRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'clinic',
    component: () => <PlaceholderPage section="Clínica" />,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN]),
  });

  const reportsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'reports',
    component: () => <PlaceholderPage section="Reportes" />,
    beforeLoad: checkRoleBeforeLoad([UserRole.ADMIN]),
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
