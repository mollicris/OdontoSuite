import { Badge } from '@mantine/core';
import { INVOICE_STATUS_CONFIG } from '../../domain/Invoice.types';
import type { InvoiceStatus } from '../../domain/Invoice.types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: string;
}

export function InvoiceStatusBadge({ status, size = 'sm' }: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUS_CONFIG[status];

  return (
    <Badge color={config.color} size={size} variant="light">
      {config.label}
    </Badge>
  );
}
