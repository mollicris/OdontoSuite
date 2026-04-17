import { Container, Grid, Card, Text, Group, Stack, SimpleGrid, ThemeIcon, Title, Table } from '@mantine/core';
import { IconUsers, IconCalendar, IconStethoscope, IconReceipt } from '@tabler/icons-react';
import { useAuthStore } from '../../auth/infrastructure/store/auth.store';
import { useDashboard } from './hooks/useDashboard';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card withBorder padding="lg" radius="md" key={label}>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="xs" fw={700} tt="uppercase">
            {label}
          </Text>
          <Text fw={700} size="lg">
            {value}
          </Text>
        </div>
        <ThemeIcon size="xl" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuthStore();
  const { stats, upcomingAppointments, recentActivity } = useDashboard();

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header - Bienvenida */}
        <div>
          <Title order={1} size="h2" fw={700} mb="xs">
            ¡Bienvenido, {user?.firstName}! 👋
          </Title>
          <Text c="dimmed" size="sm">
            Hoy es {today} • OdontoSuite Clinic
          </Text>
        </div>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <StatCard
            icon={<IconUsers size={24} />}
            label="Total Pacientes"
            value={stats.totalPatients}
            color="blue"
          />
          <StatCard
            icon={<IconCalendar size={24} />}
            label="Citas Hoy"
            value={stats.todayAppointments}
            color="green"
          />
          <StatCard
            icon={<IconStethoscope size={24} />}
            label="Tratamientos"
            value={stats.completedTreatments}
            color="violet"
          />
          <StatCard
            icon={<IconReceipt size={24} />}
            label="Facturas Pendientes"
            value={stats.pendingBilling}
            color="orange"
          />
        </SimpleGrid>

        {/* Próximas citas y Actividad reciente */}
        <Grid gap="lg">
          {/* Próximas Citas */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md">
              <Stack gap="md">
                <Title order={3} size="h5">
                  Próximas Citas
                </Title>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Paciente</Table.Th>
                      <Table.Th>Hora</Table.Th>
                      <Table.Th>Tipo</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {upcomingAppointments.map((apt) => (
                      <Table.Tr key={apt.id}>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {apt.patientName}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{apt.time}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {apt.type}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Actividad Reciente */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg" radius="md">
              <Stack gap="md">
                <Title order={3} size="h5">
                  Actividad Reciente
                </Title>
                <Stack gap="sm">
                  {recentActivity.map((activity) => (
                    <Group justify="space-between" key={activity.id} p="sm" style={{ borderBottom: '1px solid #e9ecef' }}>
                      <div>
                        <Text size="sm" fw={500}>
                          {activity.action}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {activity.patient}
                        </Text>
                      </div>
                      <Text size="xs" c="dimmed">
                        {activity.time}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
