import { useQuery } from '@tanstack/react-query';
import { listServices } from '../../../treatments/infrastructure/api/service.api';

export function useServices(clinicId: string) {
  const {
    data: services = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['services', clinicId],
    queryFn: () => listServices(clinicId),
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });

  return {
    services,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
