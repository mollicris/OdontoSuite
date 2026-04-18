import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Container, Stack, Alert, Text, Select } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PatientTreatmentHistory } from './components/PatientTreatmentHistory';
import { TreatmentFormDrawer } from './components/TreatmentFormDrawer';
import { TreatmentDetailDrawer } from './components/TreatmentDetailDrawer';
import { useTreatmentMutations } from '../application/hooks/useTreatmentMutations';
import type { TreatmentStatus } from '../domain/Treatment.types';

export function TreatmentsPage() {
  const [patientId, setPatientId] = useState<string>('');
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | undefined>();

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

  const { changeStatus, delete: deleteTreatment } = useTreatmentMutations(patientId);

  const TEST_PATIENT_ID = '3db4b080-83ef-4b10-a2c8-b81b1a26d6bb';

  const handleViewTreatment = (treatmentId: string) => {
    setSelectedTreatmentId(treatmentId);
    openDetail();
  };

  const handleChangeStatus = (id: string, status: TreatmentStatus) => {
    changeStatus({ id, status });
  };

  const handleDeleteTreatment = (id: string) => {
    deleteTreatment(id);
    closeDetail();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Text fw={700} size="xl">
            Gestión de Tratamientos
          </Text>
          <Text size="sm" c="dimmed">
            Visualiza y gestiona los tratamientos dentales de los pacientes
          </Text>
        </div>

        <Select
          label="Paciente"
          placeholder="Selecciona un paciente..."
          value={patientId}
          onChange={(val) => setPatientId(val || '')}
          data={[
            { value: TEST_PATIENT_ID, label: 'Juan Pérez (Test Patient)' },
          ]}
          searchable
          clearable
        />

        {!patientId ? (
          <Alert icon={<IconAlertCircle />} color="yellow">
            Selecciona un paciente para ver su historial de tratamientos.
          </Alert>
        ) : (
          <PatientTreatmentHistory
            patientId={patientId}
            onNewTreatment={openForm}
            onViewTreatment={handleViewTreatment}
          />
        )}

        <TreatmentFormDrawer
          opened={formOpened}
          onClose={closeForm}
          patientId={patientId}
        />

        <TreatmentDetailDrawer
          opened={detailOpened}
          onClose={closeDetail}
          treatmentId={selectedTreatmentId}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDeleteTreatment}
        />
      </Stack>
    </Container>
  );
}
