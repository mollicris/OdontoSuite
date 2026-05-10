import { Drawer, Stack, Button, Group, TextInput, Select, Alert, Text, Loader, Center } from '@mantine/core';
import { TimeInput, DateInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCreateAppointment } from './hooks/useCreateAppointment';
import { useServices } from '../application/hooks/useServices';
import { useDentists } from '../application/hooks/useDentists';
import { usePatientsList } from '../application/hooks/usePatientsList';
import { useClinicStore } from '../../clinic/infrastructure/store/clinic.store';

interface CreateAppointmentDrawerProps {
  opened: boolean;
  onClose: () => void;
  initialDate?: Date;
  patientId?: string;
}

export function CreateAppointmentDrawer({ opened, onClose, initialDate, patientId }: CreateAppointmentDrawerProps) {
  const clinicId = useClinicStore((state) => state.selectedClinicId);

  const { services = [], isLoading: servicesLoading } = useServices(clinicId || '');
  const { dentistOptions = [], isLoading: dentistsLoading } = useDentists(clinicId || '');
  const { patients = [], isLoading: patientsLoading } = usePatientsList(clinicId || '');

  const servicesOptions = Array.isArray(services) ? services.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.duration} min)`,
  })) : [];

  const patientsOptions = Array.isArray(patients) ? patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
  })) : [];

  const { form, handleSubmit, isLoading, serverError, endTime, availabilityStatus } =
    useCreateAppointment(
      services,
      clinicId || '',
      () => {
        onClose();
      },
      initialDate,
      patientId,
    );

  const isDataLoading = servicesLoading || dentistsLoading || patientsLoading;

  if (isDataLoading) {
    return (
      <Drawer position="right" opened={opened} onClose={onClose} title="Nueva Cita" size="lg">
        <Center py="xl">
          <Loader />
        </Center>
      </Drawer>
    );
  }

  return (
    <Drawer position="right" opened={opened} onClose={onClose} title="Nueva Cita" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {!patientId && (
            <Select
              label="Paciente"
              placeholder="Selecciona un paciente"
              data={patientsOptions}
              {...form.getInputProps('patientId')}
              searchable
            />
          )}

          <Select
            label="Dentista"
            placeholder="Selecciona un dentista"
            data={dentistOptions}
            {...form.getInputProps('dentistId')}
          />

          <Select
            label="Servicio"
            placeholder="Selecciona un servicio"
            data={servicesOptions}
            {...form.getInputProps('serviceId')}
          />

          <DateInput
            label="Fecha"
            placeholder="Selecciona una fecha"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps('date')}
            clearable
            highlightToday
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
