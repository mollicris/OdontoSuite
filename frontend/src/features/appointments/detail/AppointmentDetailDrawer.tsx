import { Drawer, Stack, Button, Group, Text, Avatar, Divider, Alert, Skeleton } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAppointmentStore } from '../infrastructure/store/appointment.store';
import { useAppointmentDetail } from './hooks/useAppointmentDetail';
import { useUpdateAppointment } from '../create/hooks/useUpdateAppointment';
import { AppointmentStatusBadge } from '../list/components/AppointmentStatusBadge';

interface AppointmentDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function AppointmentDetailDrawer({ opened, onClose, onRefresh }: AppointmentDetailDrawerProps) {
  const selectedAppointmentId = useAppointmentStore((s) => s.selectedAppointmentId);
  const setSelectedAppointmentId = useAppointmentStore((s) => s.setSelectedAppointmentId);
  const { appointment, isLoading } = useAppointmentDetail(selectedAppointmentId);
  const { isLoading: isUpdating, serverError, handleStatusChange, handleCancel } =
    useUpdateAppointment(appointment || null, onRefresh);

  const handleClose = () => {
    setSelectedAppointmentId(null);
    onClose();
  };

  if (isLoading) {
    return (
      <Drawer position="right" opened={opened} onClose={handleClose} title="Detalles de la Cita" size="md">
        <Stack gap="md">
          <Skeleton height={50} circle mb="xl" />
          <Skeleton height={8} radius="xl" />
          <Skeleton height={8} radius="xl" width="70%" />
          <Skeleton height={8} radius="xl" />
          <Skeleton height={8} radius="xl" width="80%" />
        </Stack>
      </Drawer>
    );
  }

  if (!appointment) {
    return (
      <Drawer position="right" opened={opened} onClose={handleClose} title="Detalles de la Cita" size="md">
        <Alert icon={<IconAlertCircle />} color="red">
          No se encontró la cita
        </Alert>
      </Drawer>
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
    <Drawer position="right" opened={true} onClose={handleClose} title="Detalles de la Cita" size="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start">
            <Avatar name={appointment.patientName} color="blue" radius="xl" size="lg" />
            <div>
              <Text fw={700} size="md">
                {appointment.patientName}
              </Text>
              <AppointmentStatusBadge status={appointment.status} size="sm" />
            </div>
          </Group>
        </Group>

        <Divider />

        <Stack gap="md">
          <div>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Dentista
            </Text>
            <Text size="sm" fw={500}>
              {appointment.dentistName}
            </Text>
          </div>

          <div>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Servicio
            </Text>
            <Text size="sm" fw={500}>
              {appointment.serviceName} ({appointment.serviceDuration} min)
            </Text>
          </div>

          <div>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Fecha y Hora
            </Text>
            <Text size="sm" fw={500}>
              {dateStr}
            </Text>
            <Text size="sm" fw={500}>
              {startTimeStr} - {endTimeStr}
            </Text>
          </div>

          {appointment.notes && (
            <div>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Notas
              </Text>
              <Text size="sm" fw={500}>
                {appointment.notes}
              </Text>
            </div>
          )}

          {appointment.status === 'CANCELLED' && appointment.cancelReason && (
            <div>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Motivo de cancelación
              </Text>
              <Text size="sm" fw={500}>
                {appointment.cancelReason}
              </Text>
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
                size="md"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                loading={isUpdating}
              >
                Iniciar Cita
              </Button>
              <Button
                fullWidth
                color="red"
                size="md"
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
              size="md"
              onClick={() => handleStatusChange('COMPLETED')}
              loading={isUpdating}
            >
              Completar Cita
            </Button>
          )}

          {appointment.status === 'COMPLETED' && (
            <Alert icon={<IconAlertCircle />} color="green">
              Esta cita ha sido completada
            </Alert>
          )}

          {appointment.status === 'CANCELLED' && (
            <Alert icon={<IconAlertCircle />} color="red">
              Esta cita ha sido cancelada
            </Alert>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}
