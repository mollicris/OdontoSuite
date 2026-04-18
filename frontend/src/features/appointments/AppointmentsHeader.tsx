import { Group, Stack, Breadcrumbs, Anchor, Title, Button, SegmentedControl, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useAppointmentStore } from './infrastructure/store/appointment.store';
import { useClinicStore } from '../clinic/infrastructure/store/clinic.store';

interface AppointmentsHeaderProps {
  onNewAppointment?: () => void;
}

export function AppointmentsHeader({ onNewAppointment }: AppointmentsHeaderProps) {
  const navigate = useNavigate();
  const selectedDate = useAppointmentStore((s) => s.selectedDate);
  const viewMode = useAppointmentStore((s) => s.viewMode);
  const setSelectedDate = useAppointmentStore((s) => s.setSelectedDate);
  const setViewMode = useAppointmentStore((s) => s.setViewMode);
  const selectedClinicId = useClinicStore((s) => s.selectedClinicId);

  const handlePrevDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const dateStr = selectedDate.toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Stack gap="md">
      <Breadcrumbs>
        <Anchor onClick={() => navigate({ to: '/backoffice/dashboard' })}>Dashboard</Anchor>
        <span>Citas</span>
      </Breadcrumbs>

      <Group justify="space-between" align="center">
        <Title order={1}>Citas</Title>
        <Button onClick={onNewAppointment} disabled={!selectedClinicId}>
          + Nueva Cita
        </Button>
      </Group>

      <Group justify="space-between" align="center">
        <Group gap="md" align="center">
          <Button
            size="sm"
            variant="subtle"
            p={0}
            leftSection={<IconChevronLeft size={16} />}
            onClick={handlePrevDate}
          >
            Anterior
          </Button>
          <Text fw={500} style={{ minWidth: 300 }} ta="center">
            {dateStr}
          </Text>
          <Button
            size="sm"
            variant="subtle"
            p={0}
            rightSection={<IconChevronRight size={16} />}
            onClick={handleNextDate}
          >
            Siguiente
          </Button>
        </Group>

        <SegmentedControl
          value={viewMode}
          onChange={(value) => setViewMode(value as any)}
          data={[
            { label: 'Día', value: 'day' },
            { label: 'Semana', value: 'week' },
            { label: 'Mes', value: 'month' },
          ]}
          size="sm"
        />
      </Group>
    </Stack>
  );
}
