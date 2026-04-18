import { Card, Group, Text, Stack, ActionIcon, Menu, Button } from '@mantine/core';
import { IconEye, IconX, IconChevronDown } from '@tabler/icons-react';
import { TreatmentStatusBadge } from './TreatmentStatusBadge';
import type { Treatment, TreatmentStatus } from '../../domain/Treatment.types';

interface TreatmentCardProps {
  treatment: Treatment;
  onView?: (id: string) => void;
  onChangeStatus?: (id: string, status: TreatmentStatus) => void;
  onDelete?: (id: string) => void;
}

export function TreatmentCard({ treatment, onView, onChangeStatus, onDelete }: TreatmentCardProps) {
  const date = new Date(treatment.scheduledDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  return (
    <Card withBorder p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Text fw={700} size="sm">
              {treatment.serviceName}
            </Text>
            <Text fw={600} size="sm" c="dimmed" style={{ marginTop: 2 }}>
              {treatment.diagnosis}
            </Text>
            <Text size="xs" c="gray" style={{ marginTop: 4 }}>
              {dateStr} • Dr. {treatment.dentistName}
            </Text>
          </div>
          <TreatmentStatusBadge status={treatment.status} size="sm" />
        </Group>

        <Group justify="space-between" align="center">
          <div>
            <Text size="xs" fw={500} c="dimmed">
              Costo:
            </Text>
            <Text size="sm" fw={700}>
              ${treatment.cost.toFixed(2)}
            </Text>
          </div>

          <Group gap={4}>
            <Button
              size="xs"
              variant="light"
              color="blue"
              leftSection={<IconEye size={14} />}
              onClick={() => onView?.(treatment.id)}
            >
              Ver
            </Button>

            <Menu position="bottom-end">
              <Menu.Target>
                <Button size="xs" variant="light" rightSection={<IconChevronDown size={14} />}>
                  Estado
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  disabled={treatment.status === 'PENDING'}
                  onClick={() => onChangeStatus?.(treatment.id, 'PENDING')}
                >
                  Pendiente
                </Menu.Item>
                <Menu.Item
                  disabled={treatment.status === 'IN_PROGRESS'}
                  onClick={() => onChangeStatus?.(treatment.id, 'IN_PROGRESS')}
                >
                  En Progreso
                </Menu.Item>
                <Menu.Item
                  disabled={treatment.status === 'COMPLETED'}
                  onClick={() => onChangeStatus?.(treatment.id, 'COMPLETED')}
                >
                  Completado
                </Menu.Item>
                <Menu.Item
                  disabled={treatment.status === 'CANCELLED'}
                  onClick={() => onChangeStatus?.(treatment.id, 'CANCELLED')}
                >
                  Cancelado
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <ActionIcon
              size="sm"
              variant="light"
              color="red"
              title="Cancelar"
              onClick={() => onDelete?.(treatment.id)}
              disabled={treatment.status === 'COMPLETED'}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
