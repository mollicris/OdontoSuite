import { Stack, TextInput, Select, Text, Skeleton, Alert } from '@mantine/core';
import { IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { useAppointmentStore } from '../infrastructure/store/appointment.store';
import { useAppointmentList } from './hooks/useAppointmentList';
import { AppointmentCard } from './components/AppointmentCard';
import { STATUS_CONFIG } from '../domain/Appointment.types';

interface AppointmentListProps {
  onSelectAppointment?: (id: string) => void;
  onViewAppointment?: (id: string) => void;
  onEditAppointment?: (id: string) => void;
  onCancelAppointment?: (id: string) => void;
}

export function AppointmentList({
  onSelectAppointment,
  onViewAppointment,
  onEditAppointment,
  onCancelAppointment,
}: AppointmentListProps) {
  const { appointments, isLoading, error, hasClinic } = useAppointmentList();
  const selectedAppointmentId = useAppointmentStore((s) => s.selectedAppointmentId);
  const searchQuery = useAppointmentStore((s) => s.searchQuery);
  const statusFilter = useAppointmentStore((s) => s.statusFilter);
  const setSearchQuery = useAppointmentStore((s) => s.setSearchQuery);
  const setStatusFilter = useAppointmentStore((s) => s.setStatusFilter);
  const setSelectedAppointmentId = useAppointmentStore((s) => s.setSelectedAppointmentId);

  if (!hasClinic) {
    return (
      <Alert icon={<IconAlertCircle />} color="yellow">
        Selecciona una clínica en el menú superior para ver citas.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} />
        <Skeleton height={80} />
        <Skeleton height={80} />
        <Skeleton height={80} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle />} color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Buscar paciente o dentista..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

      <Select
        label="Estado"
        placeholder="Filtrar por estado"
        data={[
          { value: 'ALL', label: 'Todos' },
          ...Object.entries(STATUS_CONFIG).map(([status, config]) => ({
            value: status,
            label: config.label,
          })),
        ]}
        value={statusFilter}
        onChange={(value) => value && setStatusFilter(value as any)}
        clearable
      />

      {appointments.length === 0 ? (
        <Text ta="center" py="xl" c="dimmed">
          No hay citas para esta fecha
        </Text>
      ) : (
        <Stack gap="sm">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isSelected={selectedAppointmentId === appointment.id}
              onSelect={(id) => {
                setSelectedAppointmentId(id);
                onSelectAppointment?.(id);
              }}
              onView={onViewAppointment}
              onEdit={onEditAppointment}
              onCancel={onCancelAppointment}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
