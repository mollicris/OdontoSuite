import { NavLink, Stack } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useRole } from '../../auth/application/hooks/useRole';
import { UserRole } from '../../auth/domain/roles';
import {
  IconLayoutDashboard,
  IconUsers,
  IconCalendar,
  IconClipboard,
  IconCash,
  IconReceipt,
  IconSettings,
} from '@tabler/icons-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <IconLayoutDashboard size={16} />,
    href: '/backoffice/dashboard',
    roles: [UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY, UserRole.PATIENT],
  },
  {
    label: 'Pacientes',
    icon: <IconUsers size={16} />,
    href: '/backoffice/patients',
    roles: [UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY],
  },
  {
    label: 'Citas',
    icon: <IconCalendar size={16} />,
    href: '/backoffice/appointments',
    roles: [UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY, UserRole.PATIENT],
  },
  {
    label: 'Tratamientos',
    icon: <IconClipboard size={16} />,
    href: '/backoffice/treatments',
    roles: [UserRole.ADMIN, UserRole.DENTIST],
  },
  {
    label: 'Facturación',
    icon: <IconCash size={16} />,
    href: '/backoffice/billing',
    roles: [UserRole.ADMIN, UserRole.SECRETARY],
  },
  {
    label: 'Mis Pagos',
    icon: <IconReceipt size={16} />,
    href: '/backoffice/my-payments',
    roles: [UserRole.PATIENT, UserRole.ADMIN, UserRole.SECRETARY],
  },
  {
    label: 'Configuración',
    icon: <IconSettings size={16} />,
    href: '/backoffice/settings',
    roles: [UserRole.ADMIN],
  },
];

export function RoleBoundMenu() {
  const { role } = useRole();
  const navigate = useNavigate();

  if (!role) return null;

  const visibleItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <Stack gap={0}>
      {visibleItems.map((item) => (
        <NavLink
          key={item.href}
          label={item.label}
          leftSection={item.icon}
          onClick={() => navigate({ to: item.href as any })}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </Stack>
  );
}
