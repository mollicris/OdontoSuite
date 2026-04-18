import { useState, useMemo } from 'react';
import { Stack, Text, Alert, Skeleton, SegmentedControl, Group, Button } from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useTreatmentsByPatient } from '../../application/hooks/useTreatmentsByPatient';
import { useTreatmentMutations } from '../../application/hooks/useTreatmentMutations';
import { TreatmentCard } from './TreatmentCard';
import { TreatmentTimeline } from './TreatmentTimeline';
import { TreatmentFilters } from './TreatmentFilters';
import type { TreatmentStatus } from '../../domain/Treatment.types';

interface PatientTreatmentHistoryProps {
  patientId: string;
  onNewTreatment?: () => void;
  onViewTreatment?: (treatmentId: string) => void;
}

export function PatientTreatmentHistory({
  patientId,
  onNewTreatment,
  onViewTreatment,
}: PatientTreatmentHistoryProps) {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'ALL'>('ALL');
  const [serviceIdFilter, setServiceIdFilter] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const { treatments, isLoading, error } = useTreatmentsByPatient({
    patientId,
    status: statusFilter,
    serviceId: serviceIdFilter,
  });
  const { changeStatus, delete: deleteTreatment } = useTreatmentMutations(patientId);

  const filtered = useMemo(() => {
    if (!searchQuery) return treatments;
    const query = searchQuery.toLowerCase();
    return treatments.filter((t) => t.diagnosis.toLowerCase().includes(query));
  }, [treatments, searchQuery]);

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={100} />
        <Skeleton height={100} />
        <Skeleton height={100} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle />} color="red">
        {error}
      </Alert>
    );
  }

  if (treatments.length === 0) {
    return (
      <Stack gap="md">
        <Alert icon={<IconAlertCircle />} color="blue">
          No hay tratamientos registrados para este paciente.
        </Alert>
        <Button leftSection={<IconPlus size={16} />} onClick={onNewTreatment}>
          Crear Primer Tratamiento
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text fw={700} size="lg">
          Historial de Tratamientos ({treatments.length})
        </Text>
        <Button size="sm" leftSection={<IconPlus size={16} />} onClick={onNewTreatment}>
          Nuevo Tratamiento
        </Button>
      </Group>

      <TreatmentFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        serviceIdFilter={serviceIdFilter}
        onServiceChange={(val) => setServiceIdFilter(val)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <SegmentedControl
        value={viewMode}
        onChange={(val) => setViewMode(val as 'list' | 'timeline')}
        data={[
          { value: 'list', label: 'Lista' },
          { value: 'timeline', label: 'Línea de Tiempo' },
        ]}
      />

      {viewMode === 'list' ? (
        <Stack gap="sm">
          {filtered.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              onView={(id) => {
                onViewTreatment?.(id);
              }}
              onChangeStatus={(id, status) => {
                changeStatus({ id, status });
              }}
              onDelete={(id) => {
                deleteTreatment(id);
              }}
            />
          ))}
        </Stack>
      ) : (
        <TreatmentTimeline treatments={filtered} />
      )}
    </Stack>
  );
}
