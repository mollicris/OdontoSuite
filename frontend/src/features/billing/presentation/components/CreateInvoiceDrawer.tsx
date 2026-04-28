import { useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Drawer,
  Stack,
  Group,
  Button,
  TextInput,
  Alert,
  Text,
  Table,
  ActionIcon,
  NumberInput,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { useInvoiceMutations } from '../../application/hooks/useInvoiceMutations';
import type { CreateInvoiceRequest, CreateInvoiceItemRequest } from '../../domain/Invoice.request';

interface CreateInvoiceDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateInvoiceDrawer({ opened, onClose, onSuccess }: CreateInvoiceDrawerProps) {
  const { create, createLoading } = useInvoiceMutations();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<{
    patientId: string;
    dueDate: Date | null;
    notes: string;
    items: CreateInvoiceItemRequest[];
  }>({
    initialValues: {
      patientId: '',
      dueDate: null,
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
    validate: {
      patientId: (value: string) => (value ? null : 'Selecciona un paciente'),
      dueDate: (value: Date | null) => (value ? null : 'Selecciona una fecha de vencimiento'),
      items: {
        description: (value: string) => (value ? null : 'Descripción requerida'),
        quantity: (value: number) => (value > 0 ? null : 'Cantidad debe ser mayor a 0'),
        unitPrice: (value: number) => (value > 0 ? null : 'Precio debe ser mayor a 0'),
      },
    },
  });

  const handleAddItem = () => {
    form.setFieldValue('items', [
      ...form.values.items,
      { description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    form.setFieldValue(
      'items',
      form.values.items.filter((_, i) => i !== index)
    );
  };

  const totalAmount = form.values.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (values: typeof form.values) => {
    setServerError(null);

    try {
      let dueDate = '';
      if (values.dueDate) {
        if (typeof values.dueDate === 'object' && 'toISOString' in values.dueDate) {
          dueDate = (values.dueDate as Date).toISOString().split('T')[0];
        } else if (typeof values.dueDate === 'string') {
          dueDate = values.dueDate;
        }
      }

      const req: CreateInvoiceRequest = {
        patientId: values.patientId,
        dueDate,
        notes: values.notes,
        items: values.items,
      };

      create(req, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || error?.message || 'Error al crear factura';
          setServerError(message);
        },
      });
    } catch (error: any) {
      setServerError(error?.message || 'Error desconocido');
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Nueva Factura"
      position="right"
      size="lg"
      closeOnClickOutside={!createLoading}
      closeOnEscape={!createLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {serverError && (
            <Alert icon={<IconAlertCircle />} color="red">
              {serverError}
            </Alert>
          )}

          <TextInput
            label="Paciente *"
            placeholder="ID del paciente"
            {...form.getInputProps('patientId')}
          />

          <DateInput
            label="Fecha de Vencimiento *"
            placeholder="Selecciona una fecha"
            locale="es"
            {...form.getInputProps('dueDate')}
          />

          <div>
            <Group justify="space-between" mb="md">
              <Text fw={600}>Ítems</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={handleAddItem}
              >
                Agregar Ítem
              </Button>
            </Group>

            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Descripción</Table.Th>
                  <Table.Th style={{ width: 80 }}>Cantidad</Table.Th>
                  <Table.Th style={{ width: 100 }}>Precio Unit.</Table.Th>
                  <Table.Th style={{ width: 100 }}>Total</Table.Th>
                  <Table.Th style={{ width: 40 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {form.values.items.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <TextInput
                        placeholder="Descripción"
                        size="xs"
                        {...form.getInputProps(`items.${index}.description`)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        placeholder="Qty"
                        size="xs"
                        min={1}
                        {...form.getInputProps(`items.${index}.quantity`)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        placeholder="Precio"
                        size="xs"
                        decimalScale={2}
                        fixedDecimalScale
                        {...form.getInputProps(`items.${index}.unitPrice`)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Group justify="flex-end" mt="md">
              <Text fw={600}>
                Total: ${totalAmount.toFixed(2)}
              </Text>
            </Group>
          </div>

          <Textarea
            label="Notas"
            placeholder="Notas adicionales"
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onClose} disabled={createLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={createLoading}>
              Crear Factura
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
