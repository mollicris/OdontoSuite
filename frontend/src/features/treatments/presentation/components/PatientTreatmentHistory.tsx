import { Stack, Text, Alert, Skeleton } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTreatmentsByPatient } from '../../application/hooks/useTreatmentsByPatient';
import { useTreatmentMutations } from '../../application/hooks/useTreatmentMutations';
import { TreatmentCard } from './TreatmentCard';

interface PatientTreatmentHistoryProps {
  patientId: string;
}

export function PatientTreatmentHistory({ patientId }: PatientTreatmentHistoryProps) {
  const { treatments, isLoading, error } = useTreatmentsByPatient({ patientId });
  const { changeStatus, delete: deleteTreatment } = useTreatmentMutations(patientId);

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
      <Alert icon={<IconAlertCircle />} color="blue">
        No hay tratamientos registrados para este paciente.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Text fw={700} size="lg">
        Historial de Tratamientos ({treatments.length})
      </Text>

      <Stack gap="sm">
        {treatments.map((treatment) => (
          <TreatmentCard
            key={treatment.id}
            treatment={treatment}
            onView={() => {
              // TODO: Abrir drawer de detalle
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
    </Stack>
  );
}
