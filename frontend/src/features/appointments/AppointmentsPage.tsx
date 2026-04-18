import { Container, Stack, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppointmentsHeader } from './AppointmentsHeader';
import { AppointmentCalendar } from './calendar/AppointmentCalendar';
import { AppointmentList } from './list/AppointmentList';
import { AppointmentDetail } from './detail/AppointmentDetail';
import { CreateAppointmentDrawer } from './create/CreateAppointmentDrawer';
import { useAppointmentStore } from './infrastructure/store/appointment.store';

export function AppointmentsPage() {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const setSelectedAppointmentId = useAppointmentStore((s) => s.setSelectedAppointmentId);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <AppointmentsHeader onNewAppointment={openDrawer} />

        <Grid gap="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <AppointmentCalendar />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
            <AppointmentList
              onSelectAppointment={setSelectedAppointmentId}
              onViewAppointment={() => {}}
              onEditAppointment={() => {}}
              onCancelAppointment={() => {}}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 12, md: 3 }}>
            <AppointmentDetail onRefresh={() => {}} />
          </Grid.Col>
        </Grid>
      </Stack>

      <CreateAppointmentDrawer opened={drawerOpened} onClose={closeDrawer} />
    </Container>
  );
}
