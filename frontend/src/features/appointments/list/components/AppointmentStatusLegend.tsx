import { Stack, Group, Box, Text } from '@mantine/core';
import { STATUS_CONFIG } from '../../domain/Appointment.types';

export function AppointmentStatusLegend() {
  return (
    <Stack gap="xs">
      <Text fw={600} size="sm">
        Estados
      </Text>
      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
        <Group key={status} gap="sm" align="center">
          <Box
            w={12}
            h={12}
            style={{
              backgroundColor: `var(--mantine-color-${config.color}-6)`,
              borderRadius: 2,
            }}
          />
          <Text size="sm">{config.label}</Text>
        </Group>
      ))}
    </Stack>
  );
}
