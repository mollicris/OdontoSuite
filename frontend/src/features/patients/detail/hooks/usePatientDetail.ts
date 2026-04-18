import { useQuery } from '@tanstack/react-query';
import { patientService } from '../../application/patient.service';

export function usePatientDetail(patientId: string) {
  const {
    data: patient,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getById(patientId),
    enabled: !!patientId,
    staleTime: 60_000,
  });

  return {
    patient,
    isLoading,
    error: error
      ? (error as any)?.response?.data?.message || 'Error al cargar el paciente'
      : null,
  };
}
