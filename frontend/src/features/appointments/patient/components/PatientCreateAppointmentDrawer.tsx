import { CreateAppointmentDrawer } from '../../create/CreateAppointmentDrawer';
import { useAuthStore } from '../../../auth/infrastructure/store/auth.store';

interface PatientCreateAppointmentDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function PatientCreateAppointmentDrawer({
  opened,
  onClose,
}: PatientCreateAppointmentDrawerProps) {
  const { user } = useAuthStore();

  return (
    <CreateAppointmentDrawer opened={opened} onClose={onClose} patientId={user?.id} />
  );
}
