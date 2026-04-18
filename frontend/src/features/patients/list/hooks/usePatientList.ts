import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClinicStore } from '../../../clinic/infrastructure/store/clinic.store';
import { patientService } from '../../application/patient.service';

const PAGE_SIZE = 10;

export function usePatientList() {
  const [page, setPage] = useState(1);
  const selectedClinicId = useClinicStore((s) => s.selectedClinicId);

  const {
    data: patients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patients', selectedClinicId, page],
    queryFn: () =>
      selectedClinicId
        ? patientService.list({
            clinicId: selectedClinicId,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
          })
        : Promise.resolve([]),
    enabled: !!selectedClinicId,
    staleTime: 30_000,
  });

  return {
    patients,
    isLoading,
    error: error ? (error as any)?.response?.data?.message || 'Error al cargar pacientes' : null,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    refetch,
    hasClinic: !!selectedClinicId,
  };
}
