import { Container, Stack, Grid, Card, Text, Group, ThemeIcon } from '@mantine/core';
import { IconUsers, IconClipboard, IconCash, IconChartBar } from '@tabler/icons-react';

export function AdminDashboard() {
  const stats = [
    { label: 'Usuarios Activos', value: '24', icon: IconUsers, color: 'blue' },
    { label: 'Citas Hoy', value: '12', icon: IconClipboard, color: 'green' },
    { label: 'Ingresos Este Mes', value: '$4,250', icon: IconCash, color: 'teal' },
    { label: 'Pacientes Totales', value: '156', icon: IconChartBar, color: 'purple' },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Text fw={700} size="xl">
            Panel Administrativo
          </Text>
          <Text size="sm" c="dimmed">
            Gestión completa del sistema
          </Text>
        </div>

        <Grid>
          {stats.map((stat) => (
            <Grid.Col key={stat.label} span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder p="md">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" fw={500} c="dimmed">
                      {stat.label}
                    </Text>
                    <Text fw={700} size="lg" mt="xs">
                      {stat.value}
                    </Text>
                  </div>
                  <ThemeIcon color={stat.color} variant="light" size={40}>
                    <stat.icon size={24} />
                  </ThemeIcon>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Card withBorder p="md">
          <Text fw={700} mb="md">
            Acciones Administrativas
          </Text>
          <Stack gap="sm">
            <Text size="sm">📊 Ver reportes completos</Text>
            <Text size="sm">👥 Gestionar usuarios y roles</Text>
            <Text size="sm">⚙️ Configuración del sistema</Text>
            <Text size="sm">📋 Auditoría de operaciones</Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
