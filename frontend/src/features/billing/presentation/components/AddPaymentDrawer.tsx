import { useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Drawer,
  Stack,
  Group,
  Button,
  NumberInput,
  Select,
  Alert,
  TextInput,
  Textarea,
  Text,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { useInvoiceMutations } from '../../application/hooks/useInvoiceMutations';
import { PAYMENT_METHOD_LABELS } from '../../domain/Invoice.types';

interface AddPaymentDrawerProps {
  opened: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceTotal?: number;
  invoicePaid?: number;
  onSuccess?: () => void;
}

export function AddPaymentDrawer({
  opened,
  onClose,
  invoiceId,
  invoiceTotal = 0,
  invoicePaid = 0,
  onSuccess,
}: AddPaymentDrawerProps) {
  const { addPayment, addPaymentLoading } = useInvoiceMutations();
  const [serverError, setServerError] = useState<string | null>(null);
  const remainingAmount = invoiceTotal - invoicePaid;

  const form = useForm({
    initialValues: {
      amount: 0,
      paymentMethod: 'CASH',
      paymentDate: new Date(),
      transactionId: '',
      notes: '',
    },
    validate: {
      amount: (value) => (value <= 0 ? 'El monto debe ser mayor a 0' : null),
      paymentMethod: (value) => (!value ? 'Selecciona un método de pago' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setServerError(null);

    try {
      addPayment(
        {
          invoiceId,
          req: {
            amount: values.amount,
            paymentMethod: values.paymentMethod,
            paymentDate: values.paymentDate?.toISOString(),
            transactionId: values.transactionId || undefined,
            notes: values.notes || undefined,
          },
        },
        {
          onSuccess: () => {
            form.reset();
            onSuccess?.();
          },
          onError: (error: any) => {
            const message =
              error?.response?.data?.message || error?.message || 'Error al registrar pago';
            setServerError(message);
          },
        }
      );
    } catch (error: any) {
      setServerError(error?.message || 'Error desconocido');
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Registrar Pago"
      position="right"
      size="md"
      closeOnClickOutside={!addPaymentLoading}
      closeOnEscape={!addPaymentLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {serverError && (
            <Alert icon={<IconAlertCircle />} color="red">
              {serverError}
            </Alert>
          )}

          {remainingAmount > 0 && (
            <Alert color="blue">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  Saldo Pendiente: ${remainingAmount.toFixed(2)}
                </Text>
                {form.values.amount > 0 && (
                  <Text size="sm">
                    Después del pago: ${Math.max(0, remainingAmount - form.values.amount).toFixed(2)}
                  </Text>
                )}
              </Stack>
            </Alert>
          )}

          <NumberInput
            label="Monto *"
            placeholder="0.00"
            decimalScale={2}
            fixedDecimalScale
            max={remainingAmount}
            {...form.getInputProps('amount')}
          />

          <Select
            label="Método de Pago *"
            placeholder="Selecciona un método"
            data={Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => ({
              value: key,
              label,
            }))}
            {...form.getInputProps('paymentMethod')}
          />

          <DateInput
            label="Fecha del Pago"
            placeholder="Selecciona una fecha"
            locale="es"
            defaultValue={new Date()}
            {...form.getInputProps('paymentDate')}
          />

          <TextInput
            label="ID de Transacción"
            placeholder="Número de referencia"
            {...form.getInputProps('transactionId')}
          />

          <Textarea
            label="Notas"
            placeholder="Notas adicionales"
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onClose} disabled={addPaymentLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={addPaymentLoading}>
              Registrar Pago
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
