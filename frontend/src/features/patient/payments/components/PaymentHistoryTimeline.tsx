import { Stack, Text, Group, Badge, Timeline, ThemeIcon } from '@mantine/core';
import { IconCheck, IconClock, IconAlertCircle } from '@tabler/icons-react';
import type { Invoice, Payment } from '../../../billing/domain/Invoice.types';

interface PaymentHistoryTimelineProps {
  invoices: Invoice[];
}

export function PaymentHistoryTimeline({ invoices }: PaymentHistoryTimelineProps) {
  // Crear timeline de pagos de las últimas facturas
  const timelineEvents = invoices
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .flatMap((invoice) => {
      const events = [];

      // Evento: Factura creada
      events.push({
        type: 'invoice_created',
        invoice,
        date: new Date(invoice.date),
        title: `Factura ${invoice.invoiceNumber} creada`,
        amount: invoice.totalAmount,
        status: 'created' as const,
      });

      // Eventos: Pagos realizados
      if (invoice.payments && invoice.payments.length > 0) {
        invoice.payments.forEach((payment: Payment) => {
          events.push({
            type: 'payment_received',
            invoice,
            date: new Date(payment.paymentDate),
            title: `Pago recibido - ${payment.paymentMethod}`,
            amount: payment.amount,
            status: 'paid' as const,
          });
        });
      }

      // Evento: Factura completada
      if (invoice.status === 'PAID') {
        events.push({
          type: 'invoice_completed',
          invoice,
          date: new Date(invoice.updatedAt),
          title: `Factura ${invoice.invoiceNumber} pagada completamente`,
          amount: invoice.totalAmount,
          status: 'completed' as const,
        });
      }

      // Evento: Factura vencida
      if (invoice.status === 'OVERDUE') {
        events.push({
          type: 'invoice_overdue',
          invoice,
          date: new Date(invoice.dueDate),
          title: `Factura ${invoice.invoiceNumber} vencida`,
          amount: invoice.remainingAmount,
          status: 'overdue' as const,
        });
      }

      return events;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <IconCheck size={16} />;
      case 'created':
        return <IconClock size={16} />;
      case 'overdue':
        return <IconAlertCircle size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const getColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'green';
      case 'created':
        return 'blue';
      case 'overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (timelineEvents.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Text c="dimmed">Sin historial de pagos</Text>
      </Stack>
    );
  }

  return (
    <Timeline active={timelineEvents.length} bulletSize={28} lineWidth={2}>
      {timelineEvents.map((event, index) => (
        <Timeline.Item
          key={`${event.invoice.id}-${event.type}-${index}`}
          bullet={<ThemeIcon size={28} radius="50%" color={getColor(event.status)}>{getIcon(event.status)}</ThemeIcon>}
          title={
            <Group justify="space-between" align="flex-start">
              <Stack gap={0}>
                <Text fw={600} size="sm">
                  {event.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {event.date.toLocaleDateString('es-ES', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Stack>
              <Text fw={700} size="sm" c={getColor(event.status)}>
                ${event.amount.toFixed(2)}
              </Text>
            </Group>
          }
        >
          <Stack gap="xs" pt="md">
            {event.type === 'payment_received' && (
              <Group gap="xs">
                <Badge size="sm" variant="light" color={getColor(event.status)}>
                  Pago registrado
                </Badge>
              </Group>
            )}
            {event.type === 'invoice_completed' && (
              <Group gap="xs">
                <Badge size="sm" variant="light" color="green">
                  Pagado completamente
                </Badge>
              </Group>
            )}
            {event.type === 'invoice_overdue' && (
              <Group gap="xs">
                <Badge size="sm" variant="light" color="red">
                  Requiere pago
                </Badge>
              </Group>
            )}
          </Stack>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
