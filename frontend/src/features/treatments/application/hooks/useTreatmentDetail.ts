import { useQuery } from '@tanstack/react-query';
import { treatmentService } from '../treatment.service';

export function useTreatmentDetail(treatmentId?: string) {
  const {
    data: treatment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['treatment', treatmentId],
    queryFn: () => (treatmentId ? treatmentService.getById(treatmentId) : Promise.resolve(null)),
    enabled: !!treatmentId,
    staleTime: 60_000,
  });

  return {
    treatment,
    isLoading,
    error: error ? (error as any)?.response?.data?.message || 'Error al cargar tratamiento' : null,
    refetch,
  };
}
