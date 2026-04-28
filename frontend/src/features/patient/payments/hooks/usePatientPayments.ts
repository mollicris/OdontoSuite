import { useQuery } from '@tanstack/react-query';
import { listInvoices } from '../../../billing/infrastructure/api/invoice.api';
import type { Invoice } from '../../../billing/domain/Invoice.types';

interface UsePatientPaymentsOptions {
  skip?: number;
  take?: number;
}

export function usePatientPayments(patientId: string, options?: UsePatientPaymentsOptions) {
  const { skip = 0, take = 50 } = options || {};

  const {
    data: invoices = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patientPayments', patientId, skip, take],
    queryFn: async () => {
      if (!patientId) return [];

      try {
        const result = await listInvoices({
          patientId,
          skip,
          take,
        });
        return result;
      } catch (err) {
        console.error('Error fetching patient payments:', err);
        throw new Error('No se pudieron cargar las facturas. Intenta de nuevo.');
      }
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    invoices: invoices as Invoice[],
    isLoading,
    error: error instanceof Error ? error.message : error ? 'Error desconocido' : null,
    refetch,
  };
}
