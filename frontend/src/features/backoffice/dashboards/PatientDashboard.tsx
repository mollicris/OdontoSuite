import { Container, Stack, Card, Text, Group, Badge, Button, Tabs } from '@mantine/core';
import { IconCalendar, IconClipboard, IconDownload } from '@tabler/icons-react';

export function PatientDashboard() {
  const appointments = [
    { date: '2026-04-25', time: '09:00', dentist: 'Dr. García', status: 'confirmado' },
    { date: '2026-05-15', time: '14:30', dentist: 'Dr. García', status: 'agendado' },
  ];

  const treatments = [
    { date: '2026-04-18', service: 'Limpieza Dental', status: 'completado', cost: '$150' },
    { date: '2026-04-20', service: 'Tratamiento de conducto', status: 'pendiente', cost: '$450' },
  ];

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Text fw={700} size="xl">
            Mi Salud Dental
          </Text>
          <Text size="sm" c="dimmed">
            Mis citas, tratamientos e historial médico
          </Text>
        </div>

        <Tabs defaultValue="appointments">
          <Tabs.List>
            <Tabs.Tab value="appointments" leftSection={<IconCalendar size={16} />}>
              Mis Citas
            </Tabs.Tab>
            <Tabs.Tab value="treatments" leftSection={<IconClipboard size={16} />}>
              Mis Tratamientos
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconDownload size={16} />}>
              Historial
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="appointments" pt="md">
            <Stack gap="sm">
              {appointments.map((apt, idx) => (
                <Card key={idx} withBorder p="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={600} size="sm">
                        {apt.date} - {apt.time}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {apt.dentist}
                      </Text>
                    </div>
                    <Badge color={apt.status === 'confirmado' ? 'green' : 'blue'}>
                      {apt.status}
                    </Badge>
                  </Group>
                  {apt.status === 'agendado' && (
                    <Button size="xs" mt="sm" variant="light">
                      Confirmar Cita
                    </Button>
                  )}
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="treatments" pt="md">
            <Stack gap="sm">
              {treatments.map((tx, idx) => (
                <Card key={idx} withBorder p="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={600} size="sm">
                        {tx.service}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {tx.date} • {tx.cost}
                      </Text>
                    </div>
                    <Badge color={tx.status === 'completado' ? 'green' : 'yellow'}>
                      {tx.status}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <Card withBorder p="md">
              <Text size="sm">
                Descargar tu historial médico completo en PDF
              </Text>
              <Button size="sm" mt="md" variant="light">
                Descargar Historial
              </Button>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
