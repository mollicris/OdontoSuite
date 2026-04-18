import { useRole } from '../../auth/application/hooks/useRole';
import { UserRole } from '../../auth/domain/roles';
import { AdminDashboard } from '../dashboards/AdminDashboard';
import { DentistDashboard } from '../dashboards/DentistDashboard';
import { SecretaryDashboard } from '../dashboards/SecretaryDashboard';
import { PatientDashboard } from '../dashboards/PatientDashboard';
import { Center, Loader } from '@mantine/core';

export function DashboardPage() {
  const { role, isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return null;
  }

  if (!role) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  switch (role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.DENTIST:
      return <DentistDashboard />;
    case UserRole.SECRETARY:
      return <SecretaryDashboard />;
    case UserRole.PATIENT:
      return <PatientDashboard />;
    default:
      return null;
  }
}
