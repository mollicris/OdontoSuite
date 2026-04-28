import { Card, Group, Text, Stack } from '@mantine/core';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import type { Invoice } from '../../domain/Invoice.types';

interface InvoiceCardProps {
  invoice: Invoice;
  onClick: () => void;
}

export function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status === 'PENDING';
  const dueDateColor = isOverdue ? 'red' : 'gray';

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'transform 200ms, box-shadow 200ms' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700} size="lg">
              {invoice.invoiceNumber}
            </Text>
            <Text size="sm" c="dimmed">
              {invoice.patientName}
            </Text>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </Group>

        <Group justify="space-between">
          <Stack gap={4}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Total
              </Text>
              <Text size="sm" fw={600}>
                ${invoice.totalAmount.toFixed(2)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Pagado
              </Text>
              <Text size="sm" fw={600}>
                ${invoice.paidAmount.toFixed(2)}
              </Text>
            </div>
          </Stack>
          <Stack gap={4}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Restante
              </Text>
              <Text size="sm" fw={600} c={invoice.remainingAmount > 0 ? 'orange' : 'green'}>
                ${invoice.remainingAmount.toFixed(2)}
              </Text>
            </div>
          </Stack>
        </Group>

        <Text size="sm" c={dueDateColor} fw={500}>
          Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
          {isOverdue && ' (VENCIDO)'}
        </Text>
      </Stack>
    </Card>
  );
}
