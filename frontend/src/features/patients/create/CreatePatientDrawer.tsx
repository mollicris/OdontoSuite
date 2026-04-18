import {
  Drawer,
  Stack,
  Group,
  Button,
  Alert,
  TextInput,
  Select,
  TagsInput,
  Textarea,
  Tabs,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCreatePatient } from './hooks/useCreatePatient';

interface CreatePatientDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePatientDrawer({ opened, onClose, onSuccess }: CreatePatientDrawerProps) {
  const { form, handleSubmit, isLoading, serverError } = useCreatePatient(onSuccess);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Nuevo Paciente"
      position="right"
      size="lg"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {serverError && (
            <Alert icon={<IconAlertCircle />} color="red">
              {serverError}
            </Alert>
          )}

          <Tabs defaultValue="basic">
            <Tabs.List>
              <Tabs.Tab value="basic">Datos Básicos</Tabs.Tab>
              <Tabs.Tab value="medical">Info Médica</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic">
              <Stack gap="md" mt="md">
                <Group grow>
                  <TextInput
                    label="Nombre *"
                    placeholder="Juan"
                    {...form.getInputProps('firstName')}
                  />
                  <TextInput
                    label="Apellido *"
                    placeholder="Pérez"
                    {...form.getInputProps('lastName')}
                  />
                </Group>

                <TextInput
                  label="Email *"
                  type="email"
                  placeholder="juan@example.com"
                  {...form.getInputProps('email')}
                />

                <TextInput
                  label="Teléfono *"
                  placeholder="+591 7123456"
                  {...form.getInputProps('phone')}
                />

                <DateInput
                  label="Fecha de Nacimiento *"
                  placeholder="Selecciona una fecha"
                  maxDate={new Date()}
                  valueFormat="YYYY-MM-DD"
                  {...form.getInputProps('dateOfBirth')}
                />

                <Select
                  label="Género *"
                  placeholder="Selecciona un género"
                  data={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' },
                    { value: 'O', label: 'Otro' },
                  ]}
                  {...form.getInputProps('gender')}
                />

                <TextInput label="CPF / Documento" placeholder="" {...form.getInputProps('cpf')} />

                <TextInput
                  label="Dirección"
                  placeholder="Calle Principal 123"
                  {...form.getInputProps('address')}
                />

                <Group grow>
                  <TextInput label="Ciudad" placeholder="" {...form.getInputProps('city')} />
                  <TextInput
                    label="Estado/Departamento"
                    placeholder=""
                    {...form.getInputProps('state')}
                  />
                  <TextInput
                    label="Código Postal"
                    placeholder=""
                    {...form.getInputProps('zipCode')}
                  />
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="medical">
              <Stack gap="md" mt="md">
                <TextInput
                  label="Contacto de Emergencia"
                  placeholder="María Pérez"
                  {...form.getInputProps('emergencyContact')}
                />

                <TextInput
                  label="Teléfono de Emergencia"
                  placeholder="+591 7123456"
                  {...form.getInputProps('emergencyPhone')}
                />

                <TagsInput
                  label="Alergias"
                  placeholder="Escribe y presiona Enter"
                  {...form.getInputProps('allergies')}
                />

                <TagsInput
                  label="Condiciones Médicas"
                  placeholder="Escribe y presiona Enter"
                  {...form.getInputProps('medicalConditions')}
                />

                <TextInput
                  label="Seguro Médico"
                  placeholder="Nombre del seguro"
                  {...form.getInputProps('insuranceProvider')}
                />

                <Textarea
                  label="Notas adicionales"
                  placeholder="Información importante del paciente"
                  rows={3}
                  {...form.getInputProps('notes')}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              Guardar Paciente
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
