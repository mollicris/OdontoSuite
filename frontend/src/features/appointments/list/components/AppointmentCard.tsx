import { Card, Group, Text, Stack, ActionIcon } from '@mantine/core';
import { IconEye, IconEdit, IconX } from '@tabler/icons-react';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import type { Appointment } from '../../domain/Appointment.types';

interface AppointmentCardProps {
  appointment: Appointment;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onCancel,
}: AppointmentCardProps) {
  const startTime = new Date(appointment.startTime).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(appointment.endTime).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      withBorder
      p="md"
      onClick={() => onSelect?.(appointment.id)}
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
        borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600} size="sm">
              {startTime} - {endTime}
            </Text>
            <Text fw={500} size="sm" c="dimmed">
              {appointment.patientName}
            </Text>
          </div>
          <AppointmentStatusBadge status={appointment.status} size="xs" />
        </Group>

        <Group justify="space-between" align="center">
          <div>
            <Text size="xs" c="dimmed">
              {appointment.dentistName}
            </Text>
            <Text size="xs">
              {appointment.serviceName}
            </Text>
          </div>
          <Group gap={4}>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(appointment.id);
              }}
              title="Ver detalle"
            >
              <IconEye size={14} />
            </ActionIcon>
            {appointment.status === 'SCHEDULED' && (
              <>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="yellow"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(appointment.id);
                  }}
                  title="Editar"
                >
                  <IconEdit size={14} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel?.(appointment.id);
                  }}
                  title="Cancelar"
                >
                  <IconX size={14} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
