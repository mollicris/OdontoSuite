import { Stack, Card, Group, Text, Badge, ThemeIcon, Timeline, Skeleton, Center } from '@mantine/core';
import { IconClock, IconUser, IconChecks, IconX, IconAlertCircle } from '@tabler/icons-react';
import type { Appointment } from '../../domain/Appointment.types';

interface PatientAppointmentTimelineProps {
  appointments: Appointment[];
  isLoading: boolean;
  onSelectAppointment: (id: string) => void;
}

const statusConfig = {
  SCHEDULED: { color: 'blue', icon: IconClock, label: 'Programada' },
  IN_PROGRESS: { color: 'orange', icon: IconAlertCircle, label: 'En progreso' },
  COMPLETED: { color: 'green', icon: IconChecks, label: 'Completada' },
  CANCELLED: { color: 'red', icon: IconX, label: 'Cancelada' },
};

export function PatientAppointmentTimeline({
  appointments,
  isLoading,
  onSelectAppointment,
}: PatientAppointmentTimelineProps) {
  if (isLoading) {
    return (
      <Stack gap="md">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={100} radius="lg" />
        ))}
      </Stack>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card radius="lg" p="xl" withBorder style={{ background: '#f8f9fa' }}>
        <Center py="xl">
          <Stack align="center" gap="xs">
            <Text size="xl">🗓️</Text>
            <Text fw={600}>Sin citas</Text>
            <Text size="sm" c="dimmed">No tienes citas programadas aún</Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Timeline active={-1} bulletSize={24} lineWidth={2}>
      {appointments.map((apt) => {
        const status = statusConfig[apt.status as keyof typeof statusConfig];
        const StatusIcon = status.icon;
        const appointmentDate = new Date(apt.startTime);
        const dateStr = appointmentDate.toLocaleDateString('es-BO', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        });
        const timeStr = appointmentDate.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Timeline.Item
            key={apt.id}
            bullet={<StatusIcon size={16} />}
            color={status.color}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectAppointment(apt.id)}
          >
            <Card
              radius="lg"
              p="md"
              withBorder
              style={{
                background: 'white',
                border: '1px solid #e9ecef',
                transition: 'all 200ms ease',
                marginLeft: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
                el.style.borderColor = '#228be6';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
                el.style.borderColor = '#e9ecef';
              }}
            >
              <Stack gap="xs">
                {/* Fecha y hora */}
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm">
                    <ThemeIcon radius="lg" variant="light" size="lg" color={status.color}>
                      <IconClock size={18} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="sm">
                        {dateStr} · {timeStr}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {apt.serviceDuration} minutos
                      </Text>
                    </div>
                  </Group>
                  <Badge color={status.color} variant="light" size="sm">
                    {status.label}
                  </Badge>
                </Group>

                {/* Dentista y servicio */}
                <Group gap="lg">
                  <Group gap="xs">
                    <ThemeIcon radius="xl" variant="light" size="sm" color="blue">
                      <IconUser size={14} />
                    </ThemeIcon>
                    <Text size="sm">{apt.dentistName}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {apt.serviceName}
                  </Text>
                </Group>

                {/* Notas si existen */}
                {apt.notes && (
                  <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                    {apt.notes}
                  </Text>
                )}
              </Stack>
            </Card>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}
