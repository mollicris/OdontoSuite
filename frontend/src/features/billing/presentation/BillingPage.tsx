import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Container,
  Stack,
  Group,
  Title,
  Button,
  Alert,
  SimpleGrid,
  Card,
  Text,
  TextInput,
  Select,
  Pagination,
  Skeleton,
} from '@mantine/core';
import { IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { useInvoiceList } from '../application/hooks/useInvoiceList';
import { InvoiceCard } from './components/InvoiceCard';
import { CreateInvoiceDrawer } from './components/CreateInvoiceDrawer';
import { InvoiceDetailDrawer } from './components/InvoiceDetailDrawer';

export function BillingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

  const { invoices, isLoading, error, refetch, page, setPage, pageSize, stats } = useInvoiceList({
    status: statusFilter || undefined,
  });

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetail = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    openDetail();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={1}>Facturación</Title>
          <Button onClick={openCreate}>+ Nueva Factura</Button>
        </Group>

        {/* Stats */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          <Card withBorder padding="lg">
            <Text size="xs" c="dimmed" fw={500}>
              Total
            </Text>
            <Text fw={700} size="xl">
              ${stats.total.toFixed(2)}
            </Text>
          </Card>
          <Card withBorder padding="lg">
            <Text size="xs" c="dimmed" fw={500}>
              Pendiente
            </Text>
            <Text fw={700} size="xl" c="orange">
              ${stats.pending.toFixed(2)}
            </Text>
          </Card>
          <Card withBorder padding="lg">
            <Text size="xs" c="dimmed" fw={500}>
              Vencido
            </Text>
            <Text fw={700} size="xl" c="red">
              ${stats.overdue.toFixed(2)}
            </Text>
          </Card>
          <Card withBorder padding="lg">
            <Text size="xs" c="dimmed" fw={500}>
              Pagado
            </Text>
            <Text fw={700} size="xl" c="green">
              ${stats.paid.toFixed(2)}
            </Text>
          </Card>
        </SimpleGrid>

        {/* Filtros */}
        <Group gap="md">
          <TextInput
            placeholder="Buscar por número o paciente..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Estado"
            data={[
              { value: '', label: 'Todos' },
              { value: 'PENDING', label: 'Pendiente' },
              { value: 'PAID', label: 'Pagado' },
              { value: 'OVERDUE', label: 'Vencido' },
              { value: 'CANCELLED', label: 'Cancelado' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            w={200}
          />
        </Group>

        {/* Error alert */}
        {error && (
          <Alert icon={<IconAlertCircle />} color="red">
            {error}
          </Alert>
        )}

        {/* Lista de facturas */}
        {isLoading ? (
          <Stack gap="md">
            <Skeleton height={120} />
            <Skeleton height={120} />
            <Skeleton height={120} />
          </Stack>
        ) : filteredInvoices.length === 0 ? (
          <Alert icon={<IconAlertCircle />} color="blue">
            No hay facturas registradas
          </Alert>
        ) : (
          <>
            <Stack gap="md">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onClick={() => handleOpenDetail(invoice.id)}
                />
              ))}
            </Stack>

            {/* Pagination */}
            {filteredInvoices.length >= pageSize && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={page}
                  onChange={setPage}
                  size="sm"
                  radius="md"
                  total={Math.ceil(filteredInvoices.length / pageSize) + 1}
                />
              </Group>
            )}
          </>
        )}
      </Stack>

      {/* Drawers */}
      <CreateInvoiceDrawer
        opened={createOpened}
        onClose={closeCreate}
        onSuccess={() => {
          refetch();
          closeCreate();
        }}
      />

      {selectedInvoiceId && (
        <InvoiceDetailDrawer
          opened={detailOpened}
          onClose={closeDetail}
          invoiceId={selectedInvoiceId}
          onPaymentAdded={() => refetch()}
        />
      )}
    </Container>
  );
}
