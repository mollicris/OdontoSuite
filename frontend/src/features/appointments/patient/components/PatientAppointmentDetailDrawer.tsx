import { Drawer, Stack, Group, Text, Button, Divider, Badge, Alert, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconClock, IconUser } from '@tabler/icons-react';
import { useUpdateAppointment } from '../../create/hooks/useUpdateAppointment';
import type { Appointment } from '../../domain/Appointment.types';

interface PatientAppointmentDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

const statusConfig = {
  SCHEDULED: { color: 'blue', icon: IconClock, label: 'Programada' },
  IN_PROGRESS: { color: 'orange', icon: IconAlertTriangle, label: 'En progreso' },
  COMPLETED: { color: 'green', icon: IconCheck, label: 'Completada' },
  CANCELLED: { color: 'red', icon: IconAlertTriangle, label: 'Cancelada' },
};

export function PatientAppointmentDetailDrawer({
  opened,
  onClose,
  appointment,
}: PatientAppointmentDetailDrawerProps) {
  const { handleCancel } = useUpdateAppointment(appointment || null, onClose);

  if (!appointment) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        title="Detalle de Cita"
        position="right"
        size="md"
      >
        <Alert icon={<IconAlertTriangle size={16} />} title="Error" color="red">
          No se encontró la cita
        </Alert>
      </Drawer>
    );
  }

  const status = statusConfig[appointment.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;
  const appointmentDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  const dateStr = appointmentDate.toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const startTime = appointmentDate.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = endDate.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Detalle de Cita"
      position="right"
      size="md"
    >
      <Stack gap="xl">
        {/* Estado */}
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Estado
          </Text>
          <Badge color={status.color} leftSection={<StatusIcon size={14} />}>
            {status.label}
          </Badge>
        </Group>

        <Divider />

        {/* Dentista */}
        <div>
          <Group gap="xs" mb="sm">
            <ThemeIcon radius="xl" variant="light" size="md" color="blue">
              <IconUser size={18} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                Dentista
              </Text>
              <Text fw={600} size="sm">
                {appointment.dentistName}
              </Text>
            </div>
          </Group>
        </div>

        <Divider />

        {/* Servicio */}
        <div>
          <Text size="xs" c="dimmed" fw={500} tt="uppercase">
            Servicio
          </Text>
          <Text fw={600} size="sm" mt="xs">
            {appointment.serviceName}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            Duración: {appointment.serviceDuration} minutos
          </Text>
        </div>

        <Divider />

        {/* Fecha y Hora */}
        <div>
          <Text size="xs" c="dimmed" fw={500} tt="uppercase">
            Fecha y Hora
          </Text>
          <Text fw={600} size="sm" mt="xs">
            {dateStr}
          </Text>
          <Text fw={600} size="sm" mt="xs">
            {startTime} — {endTime}
          </Text>
        </div>

        <Divider />

        {/* Notas */}
        {appointment.notes && (
          <>
            <div>
              <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                Notas
              </Text>
              <Text size="sm" mt="xs" style={{ fontStyle: 'italic' }}>
                {appointment.notes}
              </Text>
            </div>
            <Divider />
          </>
        )}

        {/* Motivo de cancelación */}
        {appointment.status === 'CANCELLED' && appointment.cancelReason && (
          <>
            <Alert icon={<IconAlertTriangle size={16} />} title="Motivo de Cancelación" color="red">
              {appointment.cancelReason}
            </Alert>
            <Divider />
          </>
        )}

        {/* Estado completado */}
        {appointment.status === 'COMPLETED' && (
          <Alert icon={<IconCheck size={16} />} title="Cita Completada" color="green">
            Esta cita ha sido completada exitosamente.
          </Alert>
        )}

        {/* Acciones */}
        {appointment.status === 'SCHEDULED' && (
          <Button
            color="red"
            variant="light"
            fullWidth
            onClick={() => {
              handleCancel(appointment.id);
              onClose();
            }}
          >
            Cancelar Cita
          </Button>
        )}
      </Stack>
    </Drawer>
  );
}
