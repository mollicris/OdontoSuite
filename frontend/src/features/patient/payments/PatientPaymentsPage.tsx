import { useMemo, useState } from 'react';
import {
  Container,
  Stack,
  Group,
  Title,
  SimpleGrid,
  Card,
  Text,
  Select,
  TextInput,
  Button,
  Center,
  Loader,
  Alert,
  ActionIcon,
  RingProgress,
} from '@mantine/core';
import { IconAlertCircle, IconSearch, IconX } from '@tabler/icons-react';
import { usePatientPayments } from './hooks/usePatientPayments';
import { useAuthStore } from '../../auth/infrastructure/store/auth.store';
import { PatientInvoiceCard } from './components/PatientInvoiceCard';
import { InvoiceDetailDrawer } from '../../billing/presentation/components/InvoiceDetailDrawer';
import { PaymentHistoryTimeline } from './components/PaymentHistoryTimeline';
import type { Invoice, InvoiceStatus } from '../../billing/domain/Invoice.types';
import styles from './PatientPaymentsPage.module.css';

export function PatientPaymentsPage() {
  const user = useAuthStore((state) => state.user);
  const patientId = user?.id || '';

  const { invoices, isLoading, error } = usePatientPayments(patientId);
  const [detailOpened, setDetailOpened] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | null>(null);

  // Filtro y búsqueda
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice: Invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = invoices.reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);
    const paid = invoices.reduce((sum: number, inv: Invoice) => sum + inv.paidAmount, 0);
    const pending = invoices.reduce((sum: number, inv: Invoice) => {
      if (inv.status === 'PENDING' || inv.status === 'OVERDUE') {
        return sum + inv.remainingAmount;
      }
      return sum;
    }, 0);
    const overdue = invoices
      .filter((inv: Invoice) => inv.status === 'OVERDUE')
      .reduce((sum: number, inv: Invoice) => sum + inv.remainingAmount, 0);

    const paymentPercentage = total > 0 ? (paid / total) * 100 : 0;

    return { total, paid, pending, overdue, paymentPercentage };
  }, [invoices]);

  const selectedInvoice = invoices.find((inv: Invoice) => inv.id === selectedInvoiceId);

  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Mis Facturas y Pagos</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Administra tus facturas y realiza un seguimiento de tus pagos
            </Text>
          </div>
        </Group>

        {/* Estadísticas */}
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="lg">
          <Card withBorder className={styles.statCard}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Total Facturado
                </Text>
              </Group>
              <Text fw={700} size="lg">
                ${stats.total.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed">
                {invoices.length} factura{invoices.length !== 1 ? 's' : ''}
              </Text>
            </Stack>
          </Card>

          <Card withBorder className={styles.statCard}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Pagado
                </Text>
              </Group>
              <Group justify="space-between" align="flex-end">
                <Text fw={700} size="lg" c="green">
                  ${stats.paid.toFixed(2)}
                </Text>
                <RingProgress
                  size={60}
                  thickness={4}
                  sections={[{ value: stats.paymentPercentage, color: 'green' }]}
                  label={
                    <Text size="xs" fw={700}>
                      {stats.paymentPercentage.toFixed(0)}%
                    </Text>
                  }
                />
              </Group>
            </Stack>
          </Card>

          <Card withBorder className={styles.statCard}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Pendiente
                </Text>
              </Group>
              <Text fw={700} size="lg" c="orange">
                ${stats.pending.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed">
                Pago requerido
              </Text>
            </Stack>
          </Card>

          <Card withBorder className={`${styles.statCard} ${stats.overdue > 0 ? styles.overdue : ''}`}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Vencido
                </Text>
              </Group>
              <Text fw={700} size="lg" c={stats.overdue > 0 ? 'red' : 'gray'}>
                ${stats.overdue.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed">
                {stats.overdue > 0 ? 'Requiere atención' : 'Al día'}
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Filtros y búsqueda */}
        <Card withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <Text fw={600} size="sm">
                Filtrar Facturas
              </Text>
              {(searchTerm || statusFilter) && (
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter(null);
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              )}
            </Group>

            <Group grow>
              <TextInput
                placeholder="Buscar por número de factura..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />

              <Select
                placeholder="Filtrar por estado"
                clearable
                searchable
                data={[
                  { value: 'PENDING', label: 'Pendiente' },
                  { value: 'PAID', label: 'Pagado' },
                  { value: 'OVERDUE', label: 'Vencido' },
                  { value: 'CANCELLED', label: 'Cancelado' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as InvoiceStatus | null)}
              />
            </Group>
          </Stack>
        </Card>

        {/* Lista de facturas */}
        {filteredInvoices.length > 0 ? (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600} size="sm">
                {filteredInvoices.length} factura{filteredInvoices.length !== 1 ? 's' : ''} encontrada
                {filteredInvoices.length !== 1 ? 's' : ''}
              </Text>
            </Group>

            {filteredInvoices.map((invoice: Invoice) => (
              <div key={invoice.id}>
                <PatientInvoiceCard
                  invoice={invoice}
                  onView={() => {
                    setSelectedInvoiceId(invoice.id);
                    setDetailOpened(true);
                  }}
                />
              </div>
            ))}
          </Stack>
        ) : (
          <Card withBorder>
            <Center py="xl">
              <Stack align="center" gap="sm">
                <Text c="dimmed" fw={500}>
                  {invoices.length === 0
                    ? 'No tienes facturas aún'
                    : 'No se encontraron facturas con los filtros aplicados'}
                </Text>
                {invoices.length > 0 && (
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter(null);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </Stack>
            </Center>
          </Card>
        )}

        {/* Timeline de pagos si hay facturas */}
        {invoices.length > 0 && (
          <Card withBorder>
            <Stack gap="md">
              <Text fw={600} size="sm">
                Historial de Pagos
              </Text>
              <PaymentHistoryTimeline invoices={invoices} />
            </Stack>
          </Card>
        )}
      </Stack>

      {/* Detail Drawer */}
      {selectedInvoice && (
        <InvoiceDetailDrawer
          opened={detailOpened}
          onClose={() => setDetailOpened(false)}
          invoiceId={selectedInvoice.id}
          onPaymentAdded={() => {
            // Refetch or update
          }}
        />
      )}
    </Container>
  );
}
