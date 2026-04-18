import { Stack, Card, Text, Group, Button, Avatar, Divider, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAppointmentStore } from '../infrastructure/store/appointment.store';
import { useAppointmentDetail } from './hooks/useAppointmentDetail';
import { useUpdateAppointment } from '../create/hooks/useUpdateAppointment';
import { AppointmentStatusBadge } from '../list/components/AppointmentStatusBadge';

interface AppointmentDetailProps {
  onRefresh?: () => void;
}

export function AppointmentDetail({ onRefresh }: AppointmentDetailProps) {
  const selectedAppointmentId = useAppointmentStore((s) => s.selectedAppointmentId);
  const { appointment, isLoading } = useAppointmentDetail(selectedAppointmentId);
  const { isLoading: isUpdating, serverError, handleStatusChange, handleCancel } =
    useUpdateAppointment(appointment || null, onRefresh);

  if (!selectedAppointmentId) {
    return (
      <Card withBorder p="md">
        <Stack gap="md" align="center" justify="center" py="xl">
          <Text c="dimmed" ta="center">
            Selecciona una cita para ver los detalles
          </Text>
        </Stack>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card withBorder p="md">
        <Text c="dimmed">Cargando...</Text>
      </Card>
    );
  }

  if (!appointment) {
    return (
      <Card withBorder p="md">
        <Alert icon={<IconAlertCircle />} color="red">
          No se encontró la cita
        </Alert>
      </Card>
    );
  }

  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  const dateStr = startTime.toLocaleDateString('es-BO');
  const startTimeStr = startTime.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTimeStr = endTime.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card withBorder p="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start">
            <Avatar name={appointment.patientName} color="blue" radius="xl" size="md" />
            <div>
              <Text fw={600} size="sm">
                {appointment.patientName}
              </Text>
              <AppointmentStatusBadge status={appointment.status} size="xs" />
            </div>
          </Group>
        </Group>

        <Divider />

        <Stack gap="xs">
          <div>
            <Text size="xs" c="dimmed" fw={500}>
              Dentista
            </Text>
            <Text size="sm">{appointment.dentistName}</Text>
          </div>

          <div>
            <Text size="xs" c="dimmed" fw={500}>
              Servicio
            </Text>
            <Text size="sm">
              {appointment.serviceName} ({appointment.serviceDuration} min)
            </Text>
          </div>

          <div>
            <Text size="xs" c="dimmed" fw={500}>
              Fecha y Hora
            </Text>
            <Text size="sm">
              {dateStr} de {startTimeStr} a {endTimeStr}
            </Text>
          </div>

          {appointment.notes && (
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Notas
              </Text>
              <Text size="sm">{appointment.notes}</Text>
            </div>
          )}

          {appointment.status === 'CANCELLED' && appointment.cancelReason && (
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Motivo de cancelación
              </Text>
              <Text size="sm">{appointment.cancelReason}</Text>
            </div>
          )}
        </Stack>

        {serverError && (
          <Alert icon={<IconAlertCircle />} color="red">
            {serverError}
          </Alert>
        )}

        <Divider />

        <Stack gap="sm">
          {appointment.status === 'SCHEDULED' && (
            <>
              <Button
                fullWidth
                color="green"
                size="sm"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                loading={isUpdating}
              >
                Iniciar Cita
              </Button>
              <Button
                fullWidth
                color="red"
                size="sm"
                variant="light"
                onClick={() => handleCancel()}
                loading={isUpdating}
              >
                Cancelar Cita
              </Button>
            </>
          )}

          {appointment.status === 'IN_PROGRESS' && (
            <Button
              fullWidth
              color="blue"
              size="sm"
              onClick={() => handleStatusChange('COMPLETED')}
              loading={isUpdating}
            >
              Completar Cita
            </Button>
          )}

          {appointment.status === 'COMPLETED' && (
            <Text size="xs" c="dimmed" ta="center">
              Esta cita ha sido completada
            </Text>
          )}

          {appointment.status === 'CANCELLED' && (
            <Text size="xs" c="dimmed" ta="center">
              Esta cita ha sido cancelada
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
