import { Drawer, Stack, Button, Group, TextInput, Select, Alert, Text } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCreateAppointment } from './hooks/useCreateAppointment';
import { AppointmentDatePicker } from './components/AppointmentDatePicker';

interface CreateAppointmentDrawerProps {
  opened: boolean;
  onClose: () => void;
  initialDate?: Date;
}

const CLINIC_ID = 'f48805c5-e12b-4774-9465-6b29c880d005';

const mockServices = [
  { id: '3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d', name: 'Limpieza', duration: 30 },
];

const mockDentists = [
  { value: '64b97af4-bdfa-49d4-8a41-f0b7e5e127cc', label: 'Dr. García' },
];

const mockPatients = [
  { value: '3db4b080-83ef-4b10-a2c8-b81b1a26d6bb', label: 'Juan Pérez' },
];

export function CreateAppointmentDrawer({ opened, onClose, initialDate }: CreateAppointmentDrawerProps) {
  const { form, handleSubmit, isLoading, serverError, endTime, availabilityStatus } =
    useCreateAppointment(
      mockServices,
      CLINIC_ID,
      () => {
        onClose();
      },
      initialDate,
    );

  return (
    <Drawer position="right" opened={opened} onClose={onClose} title="Nueva Cita" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Paciente"
            placeholder="Selecciona un paciente"
            data={mockPatients}
            {...form.getInputProps('patientId')}
            searchable
          />

          <Select
            label="Dentista"
            placeholder="Selecciona un dentista"
            data={mockDentists}
            {...form.getInputProps('dentistId')}
          />

          <Select
            label="Servicio"
            placeholder="Selecciona un servicio"
            data={mockServices.map((s) => ({ value: s.id, label: `${s.name} (${s.duration} min)` }))}
            {...form.getInputProps('serviceId')}
          />

          <AppointmentDatePicker
            value={form.values.date}
            onChange={(date) => form.setFieldValue('date', date)}
          />

          <TimeInput
            label="Hora de inicio"
            placeholder="Selecciona la hora"
            {...form.getInputProps('startTime')}
          />

          <TextInput
            label="Hora de fin (calculada)"
            placeholder="Automático"
            value={endTime}
            disabled
            readOnly
          />

          <TextInput
            label="Notas"
            placeholder="Agrega notas sobre la cita"
            {...form.getInputProps('notes')}
          />

          {availabilityStatus.loading && (
            <Alert color="blue">
              Verificando disponibilidad...
            </Alert>
          )}

          {availabilityStatus.available === false && (
            <Alert icon={<IconAlertCircle />} color="red">
              {availabilityStatus.reason || 'Esta fecha y hora no está disponible'}
            </Alert>
          )}

          {availabilityStatus.available === true && (
            <Alert color="green">
              ✓ Fecha y hora disponible
            </Alert>
          )}

          {serverError && (
            <Alert icon={<IconAlertCircle />} color="red">
              {serverError}
            </Alert>
          )}

          {!serverError && !availabilityStatus.available && (
            <Text size="xs" c="dimmed">
              Por favor, completa todos los campos requeridos para agendar la cita.
            </Text>
          )}

          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={availabilityStatus.available === false || availabilityStatus.available === null}
            >
              Agendar Cita
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
