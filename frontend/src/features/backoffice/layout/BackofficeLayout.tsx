import { useEffect, useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import {
  AppShell,
  Group,
  Menu,
  Avatar,
  Text,
  Title,
  Burger,
  Box,
  Select,
} from '@mantine/core';
import {
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';
import { useAuthStore } from '../../auth/infrastructure/store/auth.store';
import { clinicService } from '../../clinic/application/clinic.service';
import { useClinicStore } from '../../clinic/infrastructure/store/clinic.store';
import { RoleBoundMenu } from './RoleBoundMenu';

export function BackofficeLayout() {
  const [mobileOpened, setMobileOpened] = useState(false);
  const { user } = useAuthStore();
  const { clinics, selectedClinicId } = useClinicStore();

  useEffect(() => {
    if (clinics.length === 0) {
      clinicService.loadClinics().catch(() => undefined);
    }
  }, [clinics.length]);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/auth/login';
  };


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

          <Group>
            <Select
              size="xs"
              placeholder="Selecciona clínica"
              data={clinics.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedClinicId}
              onChange={(id) => id && clinicService.selectClinic(id)}
              style={{ minWidth: 180 }}
              searchable
            />

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
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <RoleBoundMenu />
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
