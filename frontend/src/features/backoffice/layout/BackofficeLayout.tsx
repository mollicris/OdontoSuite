import { useState } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import {
  AppShell,
  Group,
  Menu,
  Avatar,
  Text,
  Title,
  Burger,
  NavLink,
  Stack,
  Box,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconUsers,
  IconCalendar,
  IconStethoscope,
  IconReceipt,
  IconBuildingHospital,
  IconChartBar,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';
import { useAuthStore } from '../../auth/infrastructure/store/auth.store';
import { BACKOFFICE_ROUTES } from '../router/metadata';

export function BackofficeLayout() {
  const [mobileOpened, setMobileOpened] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/auth/login';
  };

  const navItems = [
    { label: 'Dashboard', icon: IconLayoutDashboard, path: BACKOFFICE_ROUTES.DASHBOARD },
    { label: 'Pacientes', icon: IconUsers, path: BACKOFFICE_ROUTES.PATIENTS },
    { label: 'Citas', icon: IconCalendar, path: BACKOFFICE_ROUTES.APPOINTMENTS },
    { label: 'Tratamientos', icon: IconStethoscope, path: BACKOFFICE_ROUTES.TREATMENTS },
    { label: 'Facturación', icon: IconReceipt, path: BACKOFFICE_ROUTES.BILLING },
    { label: 'Clínica', icon: IconBuildingHospital, path: BACKOFFICE_ROUTES.CLINIC },
    { label: 'Reportes', icon: IconChartBar, path: BACKOFFICE_ROUTES.REPORTS },
  ];

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={mobileOpened} onClick={() => setMobileOpened(!mobileOpened)} hiddenFrom="sm" size="sm" />
            <Title order={2} size="h4" fw={700}>
              🦷 OdontoSuite
            </Title>
          </Group>

          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <Group gap={10} style={{ cursor: 'pointer' }}>
                <Box style={{ textAlign: 'right' }}>
                  <Text size="sm" fw={500}>
                    {user?.firstName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {user?.email}
                  </Text>
                </Box>
                <Avatar name={user?.fullName} color="blue" radius="xl" size="md" />
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconSettings size={14} />}>Configuración</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                Cerrar Sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <Stack gap={0} h="100%">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} />}
              onClick={() => navigate({ to: item.path })}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
