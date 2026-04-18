import { Badge } from '@mantine/core';
import { TREATMENT_STATUS_CONFIG } from '../../domain/Treatment.types';
import type { TreatmentStatus } from '../../domain/Treatment.types';

interface TreatmentStatusBadgeProps {
  status: TreatmentStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function TreatmentStatusBadge({ status, size = 'sm' }: TreatmentStatusBadgeProps) {
  const config = TREATMENT_STATUS_CONFIG[status];
  return (
    <Badge color={config.color} size={size} variant="light">
      {config.label}
    </Badge>
  );
}
