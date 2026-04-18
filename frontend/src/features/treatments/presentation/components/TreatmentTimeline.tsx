import { Timeline, Group, Text, Badge, Stack } from '@mantine/core';
import { IconCheck, IconClock, IconCircleMinus, IconAlertCircle } from '@tabler/icons-react';
import type { Treatment, TreatmentStatus } from '../../domain/Treatment.types';

interface TreatmentTimelineProps {
  treatments: Treatment[];
}

export function TreatmentTimeline({ treatments }: TreatmentTimelineProps) {
  const getIcon = (status: TreatmentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <IconCheck size={16} />;
      case 'IN_PROGRESS':
        return <IconClock size={16} />;
      case 'CANCELLED':
        return <IconCircleMinus size={16} />;
      default:
        return <IconAlertCircle size={16} />;
    }
  };

  const getColor = (status: TreatmentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'IN_PROGRESS':
        return 'blue';
      case 'CANCELLED':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const getLabel = (status: TreatmentStatus) => {
    const labels: Record<TreatmentStatus, string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return labels[status];
  };

  return (
    <Timeline active={-1} bulletSize={24} lineWidth={2}>
      {treatments.map((treatment) => {
        const date = new Date(treatment.scheduledDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}/${month}/${year}`;

        return (
          <Timeline.Item
            key={treatment.id}
            bullet={getIcon(treatment.status)}
            title={
              <Group justify="space-between">
                <div>
                  <Text fw={700} size="sm">
                    {treatment.serviceName}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {treatment.diagnosis}
                  </Text>
                </div>
                <Badge color={getColor(treatment.status)} variant="light" size="sm">
                  {getLabel(treatment.status)}
                </Badge>
              </Group>
            }
          >
            <Stack gap={4} mt="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="xs" fw={500} c="dimmed">
                    Dentista
                  </Text>
                  <Text size="sm">{treatment.dentistName}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text size="xs" fw={500} c="dimmed">
                    Fecha
                  </Text>
                  <Text size="sm" fw={600}>
                    {dateStr}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text size="xs" fw={500} c="dimmed">
                    Costo
                  </Text>
                  <Text size="sm" fw={600}>
                    ${treatment.cost.toFixed(2)}
                  </Text>
                </div>
              </Group>
            </Stack>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}
