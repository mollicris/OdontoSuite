import { useQuery } from '@tanstack/react-query';
import { listDentists } from '../../../identity/infrastructure/api/user.api';

export function useDentists(clinicId: string) {
  const {
    data: dentists = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dentists', clinicId],
    queryFn: () => listDentists(clinicId),
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });

  const dentistOptions = dentists.map((dentist) => ({
    value: dentist.id,
    label: `${dentist.firstName} ${dentist.lastName}`,
  }));

  return {
    dentists,
    dentistOptions,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
