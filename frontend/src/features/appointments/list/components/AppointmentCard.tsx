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
        backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : 'transparent',
        borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
        borderWidth: isSelected ? 2 : 1,
        transition: 'all 150ms ease',
      }}
      className={isSelected ? 'selected' : ''}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Text fw={700} size="sm" style={{ lineHeight: 1.3 }}>
              {startTime} - {endTime}
            </Text>
            <Text fw={600} size="sm" c="black" style={{ marginTop: 2 }}>
              {appointment.patientName}
            </Text>
          </div>
          <AppointmentStatusBadge status={appointment.status} size="sm" />
        </Group>

        <div style={{ borderTop: '1px solid var(--mantine-color-gray-2)', paddingTop: 8 }}>
          <Group justify="space-between" align="center">
            <div style={{ flex: 1 }}>
              <Text size="xs" fw={500} c="dimmed" style={{ marginBottom: 2 }}>
                {appointment.dentistName}
              </Text>
              <Text size="xs" fw={500} c="dark">
                {appointment.serviceName}
              </Text>
            </div>
            <Group gap={2} style={{ flexShrink: 0 }}>
              <ActionIcon
                size="sm"
                variant="light"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(appointment.id);
                }}
                title="Ver detalle"
              >
                <IconEye size={16} />
              </ActionIcon>
              {appointment.status === 'SCHEDULED' && (
                <>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="yellow"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(appointment.id);
                    }}
                    title="Editar"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel?.(appointment.id);
                    }}
                    title="Cancelar"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </>
              )}
            </Group>
          </Group>
        </div>
      </Stack>
    </Card>
  );
}
