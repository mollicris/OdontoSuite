import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '../invoice.service';

export function useInvoiceDetail(invoiceId: string) {
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceService.getById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 60_000,
  });

  return {
    invoice,
    isLoading,
    error: error ? (error as any)?.response?.data?.message || 'Error al cargar factura' : null,
  };
}
