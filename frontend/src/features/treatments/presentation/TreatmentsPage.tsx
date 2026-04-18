import { useState } from 'react';
import { Container, Stack, Alert, Text, Select } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PatientTreatmentHistory } from './components/PatientTreatmentHistory';

export function TreatmentsPage() {
  const [patientId, setPatientId] = useState<string>('');

  // Test IDs from seed.ts:
  const TEST_PATIENT_ID = '3db4b080-83ef-4b10-a2c8-b81b1a26d6bb';

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
          <PatientTreatmentHistory patientId={patientId} />
        )}
      </Stack>
    </Container>
  );
}
