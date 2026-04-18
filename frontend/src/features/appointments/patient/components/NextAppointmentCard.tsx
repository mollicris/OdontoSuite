import { Card, Stack, Group, Text, ThemeIcon, Button, Center } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { Appointment } from '../../domain/Appointment.types';

interface NextAppointmentCardProps {
  appointment: Appointment | null;
  onCancel?: () => void;
}

export function NextAppointmentCard({ appointment, onCancel }: NextAppointmentCardProps) {
  if (!appointment) {
    return (
      <Card
        radius="xl"
        p="xl"
        style={{
          background: 'linear-gradient(135deg, #228be6 0%, #7048e8 100%)',
          minHeight: 240,
        }}
      >
        <Center h="100%">
          <Stack align="center" gap="sm">
            <Text size="xl" fw={600} c="white" opacity={0.8}>
              No tienes citas programadas
            </Text>
            <Text size="sm" c="white" opacity={0.6}>
              📅 Agenda una nueva cita para continuar
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  const dayName = startDate.toLocaleDateString('es-BO', { weekday: 'long' });
  const dateStr = startDate.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
  const startTime = startDate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  const endTime = endDate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card
      radius="xl"
      p="xl"
      style={{
        background: 'linear-gradient(135deg, #228be6 0%, #7048e8 100%)',
        boxShadow: '0 20px 50px rgba(34, 139, 230, 0.25)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = '0 30px 70px rgba(34, 139, 230, 0.35)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 20px 50px rgba(34, 139, 230, 0.25)';
      }}
    >
      <Stack gap="lg" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header con icono */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="xs" fw={500} c="white" opacity={0.7} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Próxima Cita
            </Text>
            <Text size="xl" fw={700} c="white" mt="xs">
              {appointment.dentistName}
            </Text>
          </div>
          <ThemeIcon
            radius="lg"
            size="xl"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <IconCalendarEvent size={24} color="white" opacity={0.8} />
          </ThemeIcon>
        </Group>

        {/* Servicio */}
        <div>
          <Text size="sm" c="white" opacity={0.8}>
            {appointment.serviceName}
          </Text>
          <Text size="xs" c="white" opacity={0.6} mt={4}>
            Duración: {appointment.serviceDuration} minutos
          </Text>
        </div>

        {/* Fecha y Hora */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: 12 }}>
          <Group gap="xs" mb={4}>
            <Text size="sm" c="white" fw={500}>
              {dayName.charAt(0).toUpperCase() + dayName.slice(1)} {dateStr}
            </Text>
          </Group>
          <Text size="lg" fw={600} c="white">
            {startTime} — {endTime}
          </Text>
        </div>

        {/* Acciones */}
        {appointment.status === 'SCHEDULED' && (
          <Button
            variant="white"
            color="red"
            size="sm"
            mt="auto"
            onClick={onCancel}
            fullWidth
          >
            Cancelar Cita
          </Button>
        )}
      </Stack>
    </Card>
  );
}
