import { Container, Title, Text, Stack, Group, Button, Center } from '@mantine/core';
import { IconToolsOff, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../auth/infrastructure/store/auth.store';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate({ to: '/auth/login' });
  };

  return (
    <Container size="md" py={60}>
      <Center>
        <Stack gap="xl" align="center">
          <IconToolsOff size={80} stroke={1.5} color="#aa3bff" />

          <div style={{ textAlign: 'center' }}>
            <Title order={1} mb="sm">
              En Construcción
            </Title>
            <Text size="lg" c="dimmed" mb="xl">
              El dashboard está siendo desarrollado
            </Text>
          </div>

          {user && (
            <div style={{ textAlign: 'center' }}>
              <Text size="sm" c="dimmed" mb="xs">
                Bienvenido
              </Text>
              <Title order={3}>
                {user.fullName}
              </Title>
              <Text size="sm" c="dimmed">
                {user.email}
              </Text>
            </div>
          )}

          <Group justify="center" gap="md">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={18} />}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </Group>
        </Stack>
      </Center>
    </Container>
  );
}
