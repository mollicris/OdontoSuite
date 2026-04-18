import { Container, Stack, Grid, Card, Text, Group, Badge, ThemeIcon, Button } from '@mantine/core';
import { IconCalendar, IconCash, IconPhone, IconAlertCircle } from '@tabler/icons-react';

export function SecretaryDashboard() {
  const pendingTasks = [
    { task: 'Confirmar cita Juan Pérez - 09:00', priority: 'alta' },
    { task: 'Facturar tratamiento María García', priority: 'alta' },
    { task: 'Contactar paciente para seguimiento', priority: 'media' },
    { task: 'Verificar datos de nuevo paciente', priority: 'media' },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Text fw={700} size="xl">
            Panel Secretarial
          </Text>
          <Text size="sm" c="dimmed">
            Gestión de citas, facturación y pacientes
          </Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={500} c="dimmed">
                    Citas Hoy
                  </Text>
                  <Text fw={700} size="lg">
                    12
                  </Text>
                </div>
                <ThemeIcon color="blue" variant="light" size={40}>
                  <IconCalendar size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={500} c="dimmed">
                    Facturación Pendiente
                  </Text>
                  <Text fw={700} size="lg">
                    $1,850
                  </Text>
                </div>
                <ThemeIcon color="green" variant="light" size={40}>
                  <IconCash size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={500} c="dimmed">
                    Llamadas Pendientes
                  </Text>
                  <Text fw={700} size="lg">
                    5
                  </Text>
                </div>
                <ThemeIcon color="orange" variant="light" size={40}>
                  <IconPhone size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" fw={500} c="dimmed">
                    Tareas Urgentes
                  </Text>
                  <Text fw={700} size="lg">
                    2
                  </Text>
                </div>
                <ThemeIcon color="red" variant="light" size={40}>
                  <IconAlertCircle size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder p="md">
          <Text fw={700} mb="md" size="lg">
            Tareas Pendientes
          </Text>
          <Stack gap="sm">
            {pendingTasks.map((item, idx) => (
              <Group key={idx} justify="space-between" p="sm" style={{ borderBottom: '1px solid #eee' }}>
                <Text size="sm">{item.task}</Text>
                <Badge color={item.priority === 'alta' ? 'red' : 'yellow'}>
                  {item.priority}
                </Badge>
              </Group>
            ))}
          </Stack>
        </Card>

        <Card withBorder p="md">
          <Text fw={700} mb="md">
            Acciones Rápidas
          </Text>
          <Group>
            <Button variant="light">Agendar Cita</Button>
            <Button variant="light">Crear Factura</Button>
            <Button variant="light">Nuevo Paciente</Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
