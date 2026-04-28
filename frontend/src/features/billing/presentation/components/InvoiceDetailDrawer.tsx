import { useDisclosure } from '@mantine/hooks';
import {
  Drawer,
  Stack,
  Group,
  Title,
  Text,
  Table,
  Button,
  Card,
  Skeleton,
  Alert,
  Divider,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useInvoiceDetail } from '../../application/hooks/useInvoiceDetail';
import { useInvoiceMutations } from '../../application/hooks/useInvoiceMutations';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { AddPaymentDrawer } from './AddPaymentDrawer';
import type { InvoiceStatus } from '../../domain/Invoice.types';

interface InvoiceDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  invoiceId: string;
  onPaymentAdded?: () => void;
}

export function InvoiceDetailDrawer({
  opened,
  onClose,
  invoiceId,
  onPaymentAdded,
}: InvoiceDetailDrawerProps) {
  const { invoice, isLoading, error } = useInvoiceDetail(invoiceId);
  const { updateStatus, updateStatusLoading } = useInvoiceMutations();
  const [paymentOpened, { open: openPayment, close: closePayment }] = useDisclosure(false);

  const handleCancelInvoice = () => {
    if (invoice) {
      updateStatus(
        { invoiceId: invoice.id, status: 'CANCELLED' },
        {
          onSuccess: () => {
            onPaymentAdded?.();
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Drawer opened={opened} onClose={onClose} title="Detalles de Factura" position="right" size="lg">
        <Stack gap="md">
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </Stack>
      </Drawer>
    );
  }

  if (error || !invoice) {
    return (
      <Drawer opened={opened} onClose={onClose} title="Error" position="right" size="lg">
        <Alert icon={<IconAlertCircle />} color="red">
          {error || 'Factura no encontrada'}
        </Alert>
      </Drawer>
    );
  }

  const canAddPayment = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED';
  const canCancel = invoice.status === 'PENDING';

  return (
    <Drawer opened={opened} onClose={onClose} title="Detalles de Factura" position="right" size="lg">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3}>{invoice.invoiceNumber}</Title>
            <Text size="sm" c="dimmed">
              {invoice.patientName}
            </Text>
          </div>
          <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
        </Group>

        <Divider />

        {/* Info General */}
        <div>
          <Text fw={600} mb="md">
            Información General
          </Text>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Fecha:
              </Text>
              <Text size="sm">
                {new Date(invoice.date).toLocaleDateString('es-ES')}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Vencimiento:
              </Text>
              <Text size="sm">
                {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
              </Text>
            </Group>
          </Stack>
        </div>

        <Divider />

        {/* Items */}
        <div>
          <Text fw={600} mb="md">
            Ítems
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Descripción</Table.Th>
                <Table.Th style={{ width: 60 }}>Qty</Table.Th>
                <Table.Th style={{ width: 80 }}>Precio</Table.Th>
                <Table.Th style={{ width: 80 }}>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoice.items.map((item: any) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.description}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>${item.unitPrice.toFixed(2)}</Table.Td>
                  <Table.Td>${item.total.toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group justify="flex-end" mt="md">
            <Text fw={600}>
              Subtotal: ${invoice.totalAmount.toFixed(2)}
            </Text>
          </Group>
        </div>

        <Divider />

        {/* Montos */}
        <Group grow>
          <Card withBorder>
            <Text size="xs" c="dimmed" fw={500}>
              Total
            </Text>
            <Text fw={700}>${invoice.totalAmount.toFixed(2)}</Text>
          </Card>
          <Card withBorder>
            <Text size="xs" c="dimmed" fw={500}>
              Pagado
            </Text>
            <Text fw={700} c="green">
              ${invoice.paidAmount.toFixed(2)}
            </Text>
          </Card>
          <Card withBorder>
            <Text size="xs" c="dimmed" fw={500}>
              Restante
            </Text>
            <Text fw={700} c="orange">
              ${invoice.remainingAmount.toFixed(2)}
            </Text>
          </Card>
        </Group>

        <Divider />

        {/* Pagos */}
        {invoice.payments.length > 0 && (
          <div>
            <Text fw={600} mb="md">
              Pagos Registrados
            </Text>
            <Stack gap="sm">
              {invoice.payments.map((payment: any) => (
                <Card key={payment.id} withBorder padding="sm">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={600}>
                        ${payment.amount.toFixed(2)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {payment.paymentMethod}
                      </Text>
                    </div>
                    <Text size="xs">
                      {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                    </Text>
                  </Group>
                  {payment.notes && (
                    <Text size="xs" mt="sm" c="dimmed">
                      {payment.notes}
                    </Text>
                  )}
                </Card>
              ))}
            </Stack>
          </div>
        )}

        {invoice.notes && (
          <>
            <Divider />
            <div>
              <Text fw={600} mb="md">
                Notas
              </Text>
              <Text size="sm">{invoice.notes}</Text>
            </div>
          </>
        )}

        <Divider />

        {/* Acciones */}
        <Group justify="flex-end">
          {canAddPayment && (
            <Button onClick={openPayment} variant="light">
              Agregar Pago
            </Button>
          )}
          {canCancel && (
            <Button onClick={handleCancelInvoice} color="red" variant="light" loading={updateStatusLoading}>
              Cancelar Factura
            </Button>
          )}
        </Group>
      </Stack>

      <AddPaymentDrawer
        opened={paymentOpened}
        onClose={closePayment}
        invoiceId={invoice.id}
        invoiceTotal={invoice.totalAmount}
        invoicePaid={invoice.paidAmount}
        onSuccess={() => {
          closePayment();
          onPaymentAdded?.();
        }}
      />
    </Drawer>
  );
}
