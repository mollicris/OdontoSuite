import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { treatmentService } from '../treatment.service';
import type { TreatmentStatus } from '../../domain/Treatment.types';

interface UseTreatmentsByPatientProps {
  patientId?: string;
  status?: TreatmentStatus | 'ALL';
  serviceId?: string | null;
  skip?: number;
  take?: number;
}

export function useTreatmentsByPatient({
  patientId,
  status,
  serviceId,
  skip = 0,
  take = 10,
}: UseTreatmentsByPatientProps) {
  const {
    data: treatments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['treatments', patientId, status, serviceId, skip, take],
    queryFn: () => {
      if (!patientId) return Promise.resolve([]);
      return treatmentService.list({
        patientId,
        status: status === 'ALL' ? undefined : status,
        ...(serviceId ? { serviceId } : {}),
        skip,
        take,
      });
    },
    enabled: !!patientId,
    staleTime: 30_000,
  });

  const sortedTreatments = useMemo(() => {
    return [...treatments].sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
    );
  }, [treatments]);

  return {
    treatments: sortedTreatments,
    isLoading,
    error: error ? (error as any)?.response?.data?.message || 'Error al cargar tratamientos' : null,
    refetch,
  };
}
