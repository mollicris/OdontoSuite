import { useState } from 'react';
import { Container, Stack, Grid, Group, Button, Title, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useAppointmentStore } from '../infrastructure/store/appointment.store';
import { useAppointmentList } from '../list/hooks/useAppointmentList';
import { AppointmentCalendar } from '../calendar/AppointmentCalendar';
import { NextAppointmentCard } from './components/NextAppointmentCard';
import { PatientAppointmentTimeline } from './components/PatientAppointmentTimeline';
import { PatientAppointmentDetailDrawer } from './components/PatientAppointmentDetailDrawer';
import { PatientCreateAppointmentDrawer } from './components/PatientCreateAppointmentDrawer';
import type { Appointment } from '../domain/Appointment.types';

export function PatientAppointmentsPage() {
  const { appointments, isLoading } = useAppointmentList();
  const { selectedAppointmentId } = useAppointmentStore();
  const [createOpened, setCreateOpened] = useState(false);
  const [detailOpened, setDetailOpened] = useState(false);

  const selectedAppointment = appointments?.find((apt: Appointment) => apt.id === selectedAppointmentId);
  const nextAppointment = appointments?.[0];

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="flex-end">
            <div>
              <Title order={2} fw={700} size="h2">
                Mis Citas
              </Title>
              <Text size="sm" c="dimmed" mt="xs">
                Administra tus citas con el dentista
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setCreateOpened(true)}
              size="md"
            >
              Agendar Cita
            </Button>
          </Group>

          {/* Main content */}
          <Grid gap="xl">
            {/* Left: Calendar */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <AppointmentCalendar />
            </Grid.Col>

            {/* Right: Next appointment + Timeline */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {nextAppointment && (
                  <NextAppointmentCard
                    appointment={nextAppointment}
                    onCancel={() => {
                      useAppointmentStore.getState().setSelectedAppointmentId(nextAppointment.id);
                      setDetailOpened(true);
                    }}
                  />
                )}
                <PatientAppointmentTimeline
                  appointments={appointments || []}
                  isLoading={isLoading}
                  onSelectAppointment={(id) => {
                    useAppointmentStore.getState().setSelectedAppointmentId(id);
                    setDetailOpened(true);
                  }}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      {/* Drawers */}
      <PatientCreateAppointmentDrawer opened={createOpened} onClose={() => setCreateOpened(false)} />
      <PatientAppointmentDetailDrawer
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        appointment={selectedAppointment}
      />
    </>
  );
}
