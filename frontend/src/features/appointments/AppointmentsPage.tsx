import { Container, Stack, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppointmentsHeader } from './AppointmentsHeader';
import { AppointmentCalendar } from './calendar/AppointmentCalendar';
import { AppointmentList } from './list/AppointmentList';
import { AppointmentDetailDrawer } from './detail/AppointmentDetailDrawer';
import { CreateAppointmentDrawer } from './create/CreateAppointmentDrawer';
import { useAppointmentStore } from './infrastructure/store/appointment.store';

export function AppointmentsPage() {
  const [createDrawerOpened, { open: openCreateDrawer, close: closeCreateDrawer }] = useDisclosure(false);
  const [detailDrawerOpened, { open: openDetailDrawer, close: closeDetailDrawer }] = useDisclosure(false);
  const setSelectedAppointmentId = useAppointmentStore((s) => s.setSelectedAppointmentId);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <AppointmentsHeader onNewAppointment={openCreateDrawer} />

        <Grid gap="md">
          <Grid.Col span={{ base: 12, sm: 12, md: 5 }}>
            <AppointmentCalendar />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 12, md: 7 }}>
            <AppointmentList
              onSelectAppointment={(id) => {
                setSelectedAppointmentId(id);
                openDetailDrawer();
              }}
              onViewAppointment={(id) => {
                setSelectedAppointmentId(id);
                openDetailDrawer();
              }}
              onEditAppointment={(id) => {
                setSelectedAppointmentId(id);
                openDetailDrawer();
              }}
              onCancelAppointment={(id) => {
                setSelectedAppointmentId(id);
                openDetailDrawer();
              }}
            />
          </Grid.Col>
        </Grid>
      </Stack>

      <CreateAppointmentDrawer opened={createDrawerOpened} onClose={closeCreateDrawer} />
      <AppointmentDetailDrawer
        opened={detailDrawerOpened}
        onClose={closeDetailDrawer}
        onRefresh={() => {}}
      />
    </Container>
  );
}
