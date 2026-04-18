import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClinicStore } from '../../../clinic/infrastructure/store/clinic.store';
import { useAppointmentStore } from '../../infrastructure/store/appointment.store';
import { appointmentService } from '../../application/appointment.service';

export function useAppointmentList() {
  const selectedClinicId = useClinicStore((s) => s.selectedClinicId);
  const selectedDate = useAppointmentStore((s) => s.selectedDate);
  const viewMode = useAppointmentStore((s) => s.viewMode);
  const statusFilter = useAppointmentStore((s) => s.statusFilter);
  const searchQuery = useAppointmentStore((s) => s.searchQuery);

  const dateStr = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const {
    data: appointments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointments', selectedClinicId, dateStr, statusFilter, viewMode],
    queryFn: () =>
      selectedClinicId
        ? appointmentService.list({
            clinicId: selectedClinicId,
            date: dateStr,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
          })
        : Promise.resolve([]),
    enabled: !!selectedClinicId,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!searchQuery) return appointments;
    const query = searchQuery.toLowerCase();
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(query) ||
        a.dentistName.toLowerCase().includes(query),
    );
  }, [appointments, searchQuery]);

  return {
    appointments: filtered,
    isLoading,
    error: error ? (error as any)?.response?.data?.message || 'Error al cargar citas' : null,
    refetch,
    hasClinic: !!selectedClinicId,
  };
}
