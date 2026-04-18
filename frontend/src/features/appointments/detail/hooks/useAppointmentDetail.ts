import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../../application/appointment.service';

export function useAppointmentDetail(appointmentId: string | null) {
  const {
    data: appointment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => (appointmentId ? appointmentService.getById(appointmentId) : Promise.resolve(null)),
    enabled: !!appointmentId,
    staleTime: 60_000,
  });

  return {
    appointment,
    isLoading,
    error: error
      ? (error as any)?.response?.data?.message || 'Error al cargar la cita'
      : null,
  };
}
