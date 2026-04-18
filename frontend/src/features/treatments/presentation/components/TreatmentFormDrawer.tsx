import { useEffect } from 'react';
import { Drawer, Stack, Button, Group, Select, Alert, Textarea, NumberInput, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCreateTreatment } from '../../application/hooks/useCreateTreatment';

const mockServices = [
  { id: '3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d', name: 'Limpieza Dental', price: 150, duration: 30 },
  { id: 'service-treatment-001', name: 'Tratamiento de Conducto', price: 450, duration: 60 },
  { id: 'service-extraction-001', name: 'Extracción Dental', price: 200, duration: 45 },
];

const mockDentists = [
  { value: '64b97af4-bdfa-49d4-8a41-f0b7e5e127cc', label: 'Dr. David García' },
];

const mockPatients = [
  { value: '3db4b080-83ef-4b10-a2c8-b81b1a26d6bb', label: 'Juan Pérez' },
];

interface TreatmentFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  patientId?: string;
  appointmentId?: string;
}

export function TreatmentFormDrawer({
  opened,
  onClose,
  patientId,
  appointmentId,
}: TreatmentFormDrawerProps) {
  const { form, handleSubmit, isLoading, serverError, handleServiceChange } = useCreateTreatment({
    services: mockServices,
    patientId,
    onSuccess: onClose,
  });

  useEffect(() => {
    if (opened && patientId && form.values.patientId !== patientId) {
      form.setFieldValue('patientId', patientId);
    }
  }, [opened, patientId]);

  useEffect(() => {
    if (opened && appointmentId && form.values.appointmentId !== appointmentId) {
      form.setFieldValue('appointmentId', appointmentId);
    }
  }, [opened, appointmentId]);

  return (
    <Drawer position="right" opened={opened} onClose={onClose} title="Nuevo Tratamiento" size="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <div>
            <Text fw={600} size="sm" mb="xs">
              Información Básica
            </Text>

            {!patientId && (
              <Select
                label="Paciente"
                placeholder="Selecciona un paciente"
                data={mockPatients}
                {...form.getInputProps('patientId')}
                searchable
              />
            )}

            <Select
              label="Servicio"
              placeholder="Selecciona un servicio"
              data={mockServices.map((s) => ({
                value: s.id,
                label: `${s.name} - $${s.price}`,
              }))}
              value={form.values.serviceId || null}
              onChange={(val) => handleServiceChange(val)}
              error={form.errors.serviceId}
              searchable
            />

            <Select
              label="Dentista"
              placeholder="Selecciona un dentista"
              data={mockDentists}
              {...form.getInputProps('performedBy')}
            />
          </div>

          <div>
            <Text fw={600} size="sm" mb="xs">
              Diagnóstico y Tratamiento
            </Text>

            <Textarea
              label="Diagnóstico"
              placeholder="Ej: Caries profunda en pieza 16"
              {...form.getInputProps('diagnosis')}
              minRows={2}
            />

            <Textarea
              label="Tratamiento"
              placeholder="Ej: Obturación con resina compuesta"
              {...form.getInputProps('treatment')}
              minRows={2}
              mt="md"
            />

            <Textarea
              label="Observaciones"
              placeholder="Notas adicionales del procedimiento"
              {...form.getInputProps('observations')}
              minRows={2}
              mt="md"
            />
          </div>

          <div>
            <Text fw={600} size="sm" mb="xs">
              Costo y Fechas
            </Text>

            <NumberInput
              label="Costo ($)"
              placeholder="Automático del servicio"
              {...form.getInputProps('cost')}
              min={0}
              mt="md"
            />

            <DateInput
              label="Fecha Programada"
              placeholder="Selecciona una fecha"
              valueFormat="DD/MM/YYYY"
              locale="es"
              {...form.getInputProps('scheduledDate')}
              mt="md"
            />

            <DateInput
              label="Fecha Completada (Opcional)"
              placeholder="Si el tratamiento está completado"
              valueFormat="DD/MM/YYYY"
              locale="es"
              {...form.getInputProps('completedDate')}
              mt="md"
            />
          </div>

          {serverError && (
            <Alert icon={<IconAlertCircle />} color="red">
              {serverError}
            </Alert>
          )}

          {Object.keys(form.errors).length > 0 && (
            <Alert icon={<IconAlertCircle />} color="yellow">
              Por favor, completa todos los campos requeridos correctamente.
            </Alert>
          )}

          <Group justify="flex-end" gap="md">
            <Button variant="light" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              Guardar Tratamiento
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
