import { Container, Stack, Grid, Card, Text, Group, Badge, ThemeIcon, Button } from '@mantine/core';
import { IconUsers, IconStethoscope } from '@tabler/icons-react';

export function DentistDashboard() {
  const todayAppointments = [
    { time: '09:00', patient: 'Juan Pérez', service: 'Limpieza', status: 'confirmado' },
    { time: '10:30', patient: 'María García', service: 'Tratamiento de conducto', status: 'confirmado' },
    { time: '14:00', patient: 'Carlos López', service: 'Extracción', status: 'pendiente' },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Text fw={700} size="xl">
            Mi Dashboard - Dentista
          </Text>
          <Text size="sm" c="dimmed">
            Mis citas y tratamientos de hoy
          </Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder p="md">
              <Text fw={700} mb="md" size="lg">
                Citas de Hoy
              </Text>
              <Stack gap="sm">
                {todayAppointments.map((apt, idx) => (
                  <Group key={idx} justify="space-between" p="sm" style={{ borderBottom: '1px solid #eee' }}>
                    <div>
                      <Text fw={600} size="sm">
                        {apt.time} - {apt.patient}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {apt.service}
                      </Text>
                    </div>
                    <Badge color={apt.status === 'confirmado' ? 'green' : 'yellow'}>
                      {apt.status}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Card withBorder p="md">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" fw={500} c="dimmed">
                      Tratamientos Pendientes
                    </Text>
                    <Text fw={700} size="lg">
                      8
                    </Text>
                  </div>
                  <ThemeIcon color="blue" variant="light" size={40}>
                    <IconStethoscope size={24} />
                  </ThemeIcon>
                </Group>
              </Card>

              <Card withBorder p="md">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" fw={500} c="dimmed">
                      Mis Pacientes
                    </Text>
                    <Text fw={700} size="lg">
                      34
                    </Text>
                  </div>
                  <ThemeIcon color="green" variant="light" size={40}>
                    <IconUsers size={24} />
                  </ThemeIcon>
                </Group>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        <Card withBorder p="md">
          <Text fw={700} mb="md">
            Acciones Rápidas
          </Text>
          <Group>
            <Button variant="light">Nueva Cita</Button>
            <Button variant="light">Nuevo Tratamiento</Button>
            <Button variant="light">Ver Pacientes</Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
