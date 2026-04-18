import { Badge } from '@mantine/core';
import { STATUS_CONFIG } from '../../domain/Appointment.types';
import type { AppointmentStatus } from '../../domain/Appointment.types';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AppointmentStatusBadge({ status, size = 'sm' }: AppointmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge color={config.color} size={size} variant="light">
      {config.label}
    </Badge>
  );
}
