import { Drawer, Stack, Group, Text, Divider, Alert, Skeleton, Button, ActionIcon, Menu } from '@mantine/core';
import { IconAlertCircle, IconDownload, IconX, IconChevronDown } from '@tabler/icons-react';
import { useTreatmentDetail } from '../../application/hooks/useTreatmentDetail';
import { TreatmentStatusBadge } from './TreatmentStatusBadge';
import type { TreatmentStatus } from '../../domain/Treatment.types';

interface TreatmentDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  treatmentId?: string;
  onChangeStatus?: (id: string, status: TreatmentStatus) => void;
  onDelete?: (id: string) => void;
}

export function TreatmentDetailDrawer({
  opened,
  onClose,
  treatmentId,
  onChangeStatus,
  onDelete,
}: TreatmentDetailDrawerProps) {
  const { treatment, isLoading, error } = useTreatmentDetail(treatmentId);

  if (isLoading) {
    return (
      <Drawer position="right" opened={opened} onClose={onClose} title="Detalle del Tratamiento" size="md">
        <Stack gap="md">
          <Skeleton height={40} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </Stack>
      </Drawer>
    );
  }

  if (error || !treatment) {
    return (
      <Drawer position="right" opened={opened} onClose={onClose} title="Detalle del Tratamiento" size="md">
        <Alert icon={<IconAlertCircle />} color="red">
          {error || 'No se pudo cargar el tratamiento'}
        </Alert>
      </Drawer>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const scheduledDate = formatDate(treatment.scheduledDate);
  const completedDate = treatment.completedDate ? formatDate(treatment.completedDate) : null;

  return (
    <Drawer position="right" opened={opened} onClose={onClose} title="Detalle del Tratamiento" size="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700} size="lg">
              {treatment.serviceName}
            </Text>
            <TreatmentStatusBadge status={treatment.status} size="md" />
          </div>
          <ActionIcon
            size="lg"
            variant="light"
            color="red"
            onClick={() => {
              if (treatment.id) {
                onDelete?.(treatment.id);
                onClose();
              }
            }}
            disabled={treatment.status === 'COMPLETED'}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>

        <Divider />

        {/* Paciente y Dentista */}
        <div>
          <Text fw={600} size="sm" mb="xs">
            Información
          </Text>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed">
                Paciente
              </Text>
              <Text fw={600} size="sm">
                {treatment.patientName}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Dentista
              </Text>
              <Text fw={600} size="sm">
                {treatment.dentistName}
              </Text>
            </div>
          </Group>
        </div>

        <Divider />

        {/* Diagnosis y Treatment */}
        <div>
          <Text fw={600} size="sm" mb="xs">
            Diagnóstico
          </Text>
          <Text size="sm">{treatment.diagnosis}</Text>
        </div>

        <div>
          <Text fw={600} size="sm" mb="xs">
            Tratamiento
          </Text>
          <Text size="sm">{treatment.treatment}</Text>
        </div>

        {treatment.observations && (
          <div>
            <Text fw={600} size="sm" mb="xs">
              Observaciones
            </Text>
            <Text size="sm">{treatment.observations}</Text>
          </div>
        )}

        {treatment.notes && (
          <div>
            <Text fw={600} size="sm" mb="xs">
              Notas
            </Text>
            <Text size="sm">{treatment.notes}</Text>
          </div>
        )}

        <Divider />

        {/* Fechas y Costo */}
        <div>
          <Text fw={600} size="sm" mb="xs">
            Fechas
          </Text>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed">
                Programada
              </Text>
              <Text fw={600} size="sm">
                {scheduledDate}
              </Text>
            </div>
            {completedDate && (
              <div>
                <Text size="xs" c="dimmed">
                  Completada
                </Text>
                <Text fw={600} size="sm">
                  {completedDate}
                </Text>
              </div>
            )}
          </Group>
        </div>

        <div>
          <Text fw={600} size="sm" mb="xs">
            Costo
          </Text>
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed">
                Servicio
              </Text>
              <Text fw={600} size="sm">
                ${treatment.servicePrice.toFixed(2)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Tratamiento
              </Text>
              <Text fw={700} size="lg">
                ${treatment.cost.toFixed(2)}
              </Text>
            </div>
          </Group>
        </div>

        <Divider />

        {/* Acciones */}
        <Group justify="space-between">
          <Menu position="bottom-start">
            <Menu.Target>
              <Button size="sm" variant="light" rightSection={<IconChevronDown size={14} />}>
                Cambiar Estado
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                disabled={treatment.status === 'PENDING'}
                onClick={() => {
                  if (treatment.id) {
                    onChangeStatus?.(treatment.id, 'PENDING');
                  }
                }}
              >
                Pendiente
              </Menu.Item>
              <Menu.Item
                disabled={treatment.status === 'IN_PROGRESS'}
                onClick={() => {
                  if (treatment.id) {
                    onChangeStatus?.(treatment.id, 'IN_PROGRESS');
                  }
                }}
              >
                En Progreso
              </Menu.Item>
              <Menu.Item
                disabled={treatment.status === 'COMPLETED'}
                onClick={() => {
                  if (treatment.id) {
                    onChangeStatus?.(treatment.id, 'COMPLETED');
                  }
                }}
              >
                Completado
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Button size="sm" variant="light" leftSection={<IconDownload size={14} />}>
            Descargar
          </Button>
        </Group>

        <Button onClick={onClose} fullWidth>
          Cerrar
        </Button>
      </Stack>
    </Drawer>
  );
}
