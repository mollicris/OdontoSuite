import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { invoiceService } from '../invoice.service';
import type { CreateInvoiceRequest, AddPaymentRequest } from '../../domain/Invoice.request';

export function useInvoiceMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (req: CreateInvoiceRequest) => invoiceService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      notifications.show({
        title: 'Éxito',
        message: 'Factura creada correctamente',
        color: 'green',
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Error al crear factura',
        color: 'red',
        autoClose: 3000,
      });
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({ invoiceId, req }: { invoiceId: string; req: AddPaymentRequest }) =>
      invoiceService.addPayment(invoiceId, req),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      notifications.show({
        title: 'Éxito',
        message: 'Pago registrado correctamente',
        color: 'green',
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Error al registrar pago',
        color: 'red',
        autoClose: 3000,
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: string; status: string }) =>
      invoiceService.updateStatus(invoiceId, status),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      notifications.show({
        title: 'Éxito',
        message: 'Estado actualizado correctamente',
        color: 'green',
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Error al actualizar estado',
        color: 'red',
        autoClose: 3000,
      });
    },
  });

  return {
    create: createMutation.mutate,
    createLoading: createMutation.isPending,
    addPayment: addPaymentMutation.mutate,
    addPaymentLoading: addPaymentMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    updateStatusLoading: updateStatusMutation.isPending,
  };
}
