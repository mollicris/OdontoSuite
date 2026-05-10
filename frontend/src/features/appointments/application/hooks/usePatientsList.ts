import { useQuery } from '@tanstack/react-query';
import { listPatients } from '../../../patients/infrastructure/api/patient.api';

export function usePatientsList(clinicId: string) {
  const {
    data: patients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patients-list', clinicId],
    queryFn: () => listPatients({ clinicId, take: 100 }),
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });

  return {
    patients,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
