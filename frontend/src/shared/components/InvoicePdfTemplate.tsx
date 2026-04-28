import { Paper, Stack, Group, Text, Table, Divider, Grid } from '@mantine/core';
import type { Invoice } from '../../features/billing/domain/Invoice.types';
import styles from './InvoicePdfTemplate.module.css';

interface InvoicePdfTemplateProps {
  invoice: Invoice;
  forPrint?: boolean;
}

/**
 * Componente que renderiza la factura en formato PDF/impresible
 * Se usa con html2canvas para generar PDFs
 */
export const InvoicePdfTemplate = ({ invoice, forPrint = false }: InvoicePdfTemplateProps) => {
  return (
    <Paper
      className={forPrint ? styles.printTemplate : ''}
      style={{
        width: forPrint ? '210mm' : '100%',
        height: forPrint ? '297mm' : 'auto',
        margin: '0 auto',
        padding: '20mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="xl" fw={700} c="rgb(0, 102, 204)">
              FACTURA
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text size="lg" fw={700}>
              {invoice.invoiceNumber}
            </Text>
            <Text size="sm" c="dimmed">
              {new Date(invoice.date).toLocaleDateString('es-ES')}
            </Text>
          </div>
        </Group>

        <Divider />

        {/* Información General */}
        <Group grow>
          <div>
            <Text size="sm" fw={600} c="dimmed">
              PACIENTE
            </Text>
            <Text fw={500}>{invoice.patientName}</Text>
            <Text size="sm" c="dimmed">
              ID: {invoice.patientId}
            </Text>
          </div>

          <div>
            <Text size="sm" fw={600} c="dimmed">
              CLÍNICA
            </Text>
            <Text fw={500}>OdontoSuite</Text>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Text size="sm" fw={600} c="dimmed">
              ESTADO
            </Text>
            <Text fw={500} size="lg" c={getStatusColor(invoice.status)}>
              {getStatusLabel(invoice.status)}
            </Text>
          </div>
        </Group>

        <Divider />

        {/* Fechas */}
        <Group grow>
          <div>
            <Text size="sm" fw={600} c="dimmed">
              FECHA DE EMISIÓN
            </Text>
            <Text fw={500}>{new Date(invoice.date).toLocaleDateString('es-ES')}</Text>
          </div>

          <div>
            <Text size="sm" fw={600} c="dimmed">
              FECHA DE VENCIMIENTO
            </Text>
            <Text fw={500}>{new Date(invoice.dueDate).toLocaleDateString('es-ES')}</Text>
          </div>
        </Group>

        <Divider />

        {/* Items */}
        <div>
          <Text size="sm" fw={600} c="dimmed" mb="xs">
            ÍTEMS DE FACTURACIÓN
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Descripción</Table.Th>
                <Table.Th style={{ width: 80, textAlign: 'center' }}>Cantidad</Table.Th>
                <Table.Th style={{ width: 100, textAlign: 'right' }}>Precio Unit.</Table.Th>
                <Table.Th style={{ width: 100, textAlign: 'right' }}>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoice.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.description}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text fw={600}>${item.total.toFixed(2)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>

        <Divider />

        {/* Resumen */}
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            {invoice.payments && invoice.payments.length > 0 && (
              <div>
                <Text size="sm" fw={600} c="dimmed" mb="xs">
                  PAGOS REGISTRADOS
                </Text>
                <Stack gap="xs">
                  {invoice.payments.map((payment, idx) => (
                    <Group key={idx} justify="space-between" p="xs" style={{ backgroundColor: '#f5f5f5' }}>
                      <div>
                        <Text size="sm" fw={500}>
                          {payment.paymentMethod}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                        </Text>
                      </div>
                      <Text fw={600} c="green">
                        ${payment.amount.toFixed(2)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </div>
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="md" style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px' }}>
              <Group justify="space-between">
                <Text fw={600}>TOTAL FACTURADO:</Text>
                <Text fw={700} size="lg">
                  ${invoice.totalAmount.toFixed(2)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text fw={600} c="green">
                  PAGADO:
                </Text>
                <Text fw={700} size="lg" c="green">
                  ${invoice.paidAmount.toFixed(2)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text fw={600} c={invoice.remainingAmount > 0 ? 'orange' : 'gray'}>
                  PENDIENTE:
                </Text>
                <Text fw={700} size="lg" c={invoice.remainingAmount > 0 ? 'orange' : 'gray'}>
                  ${invoice.remainingAmount.toFixed(2)}
                </Text>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

        {invoice.notes && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={600} c="dimmed">
                NOTAS
              </Text>
              <Text size="sm">{invoice.notes}</Text>
            </div>
          </>
        )}

        <Divider />

        {/* Footer */}
        <Text size="xs" c="dimmed" style={{ textAlign: 'center', marginTop: 'auto' }}>
          Documento generado automáticamente por OdontoSuite el{' '}
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          .
        </Text>
      </Stack>
    </Paper>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
      return 'rgb(34, 139, 34)';
    case 'PENDING':
      return 'rgb(184, 134, 11)';
    case 'OVERDUE':
      return 'rgb(220, 20, 60)';
    case 'CANCELLED':
      return 'rgb(128, 128, 128)';
    default:
      return 'rgb(0, 0, 0)';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PAID':
      return 'PAGADO';
    case 'PENDING':
      return 'PENDIENTE';
    case 'OVERDUE':
      return 'VENCIDO';
    case 'CANCELLED':
      return 'CANCELADO';
    default:
      return status;
  }
}
