import { useState } from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  Button,
  Badge,
  Progress,
  ActionIcon,
  ThemeIcon,
} from '@mantine/core';
import { IconDownload, IconChevronRight, IconFileInvoice } from '@tabler/icons-react';
import { InvoiceStatusBadge } from '../../../billing/presentation/components/InvoiceStatusBadge';
import { generateInvoicePdfFromData } from '../../../../shared/services/pdf/invoicePdfGenerator';
import type { Invoice } from '../../../billing/domain/Invoice.types';
import styles from '../PatientPaymentsPage.module.css';

interface PatientInvoiceCardProps {
  invoice: Invoice;
  onView: () => void;
}

export function PatientInvoiceCard({ invoice, onView }: PatientInvoiceCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const paymentPercentage = (invoice.paidAmount / invoice.totalAmount) * 100;
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  const isOverdue = dueDate < today && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED';
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateInvoicePdfFromData(invoice, {
        fileName: `${invoice.invoiceNumber}.pdf`,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card withBorder className={styles.invoiceCardContainer}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start">
            <ThemeIcon size="lg" radius="md" variant="light">
              <IconFileInvoice size={24} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text fw={600} size="lg">
                {invoice.invoiceNumber}
              </Text>
              <Text size="sm" c="dimmed">
                {new Date(invoice.date).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </Stack>
          </Group>
          <InvoiceStatusBadge status={invoice.status} />
        </Group>

        {/* Monto y estado de pago */}
        <Group justify="space-between">
          <Stack gap={0}>
            <Text size="sm" c="dimmed">
              Monto Total
            </Text>
            <Text fw={700} size="lg">
              ${invoice.totalAmount.toFixed(2)}
            </Text>
          </Stack>

          <Stack gap={0} align="flex-end">
            <Text size="sm" c="dimmed">
              Pagado
            </Text>
            <Text fw={600} c="green" size="lg">
              ${invoice.paidAmount.toFixed(2)}
            </Text>
          </Stack>

          <Stack gap={0} align="flex-end">
            <Text size="sm" c="dimmed">
              Pendiente
            </Text>
            <Text fw={600} c={invoice.remainingAmount > 0 ? 'orange' : 'gray'} size="lg">
              ${invoice.remainingAmount.toFixed(2)}
            </Text>
          </Stack>
        </Group>

        {/* Progress Bar */}
        {invoice.totalAmount > 0 && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" fw={500} c="dimmed">
                Progreso de Pago
              </Text>
              <Text size="xs" fw={600}>
                {paymentPercentage.toFixed(0)}%
              </Text>
            </Group>
            <Progress
              value={paymentPercentage}
              color={
                paymentPercentage === 100
                  ? 'green'
                  : paymentPercentage >= 50
                    ? 'blue'
                    : paymentPercentage > 0
                      ? 'yellow'
                      : 'gray'
              }
              size="md"
              radius="md"
              striped={paymentPercentage < 100}
            />
          </Stack>
        )}

        {/* Due Date Info */}
        <Group justify="space-between">
          <Stack gap={0}>
            <Text size="sm" c="dimmed">
              Vencimiento
            </Text>
            <Group gap="xs">
              <Text fw={600} size="sm">
                {dueDate.toLocaleDateString('es-ES')}
              </Text>
              {isOverdue ? (
                <Badge color="red" size="sm" variant="light">
                  ⚠️ Vencido hace {Math.abs(daysUntilDue)} días
                </Badge>
              ) : daysUntilDue > 0 && daysUntilDue <= 7 ? (
                <Badge color="yellow" size="sm" variant="light">
                  Vence en {daysUntilDue} día{daysUntilDue !== 1 ? 's' : ''}
                </Badge>
              ) : invoice.status === 'PAID' ? (
                <Badge color="green" size="sm" variant="light">
                  Pagado
                </Badge>
              ) : null}
            </Group>
          </Stack>
        </Group>

        {/* Acciones */}
        <Group justify="flex-end" mt="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handleDownload}
            disabled={isDownloading}
            loading={isDownloading}
            title="Descargar PDF"
          >
            <IconDownload size={18} />
          </ActionIcon>
          <Button
            variant="light"
            rightSection={<IconChevronRight size={16} />}
            onClick={onView}
            fullWidth
          >
            Ver Detalle
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
