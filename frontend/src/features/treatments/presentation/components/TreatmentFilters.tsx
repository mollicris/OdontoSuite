import { Group, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { TreatmentStatus } from '../../domain/Treatment.types';

const SERVICES = [
  { value: '3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d', label: 'Limpieza Dental' },
  { value: 'service-treatment-001', label: 'Tratamiento de Conducto' },
  { value: 'service-extraction-001', label: 'Extracción Dental' },
];

interface TreatmentFiltersProps {
  statusFilter?: TreatmentStatus | 'ALL';
  onStatusChange?: (status: TreatmentStatus | 'ALL') => void;
  serviceIdFilter?: string;
  onServiceChange?: (serviceId: string | undefined) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TreatmentFilters({
  statusFilter = 'ALL',
  onStatusChange,
  serviceIdFilter,
  onServiceChange,
  searchQuery = '',
  onSearchChange,
}: TreatmentFiltersProps) {
  return (
    <Group gap="md">
      <TextInput
        placeholder="Buscar diagnóstico..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => onSearchChange?.(e.currentTarget.value)}
        style={{ flex: 1, minWidth: 200 }}
      />

      <Select
        placeholder="Estado"
        data={[
          { value: 'ALL', label: 'Todos los estados' },
          { value: 'PENDING', label: 'Pendiente' },
          { value: 'IN_PROGRESS', label: 'En Progreso' },
          { value: 'COMPLETED', label: 'Completado' },
          { value: 'CANCELLED', label: 'Cancelado' },
        ]}
        value={statusFilter}
        onChange={(val) => onStatusChange?.(val as TreatmentStatus | 'ALL')}
        clearable
        searchable
        style={{ minWidth: 150 }}
      />

      <Select
        placeholder="Servicio"
        data={SERVICES}
        value={serviceIdFilter || null}
        onChange={(val) => onServiceChange?.(val ? val : undefined)}
        clearable
        searchable
        style={{ minWidth: 150 }}
      />
    </Group>
  );
}
